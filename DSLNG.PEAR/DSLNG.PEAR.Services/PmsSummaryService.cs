﻿using System;
using System.Collections.Generic;
using System.Linq;
using DSLNG.PEAR.Common.Extensions;
using DSLNG.PEAR.Data.Entities;
using DSLNG.PEAR.Data.Enums;
using DSLNG.PEAR.Data.Persistence;
using DSLNG.PEAR.Services.Interfaces;
using DSLNG.PEAR.Services.Requests.Pillar;
using DSLNG.PEAR.Services.Requests.PmsSummary;
using DSLNG.PEAR.Services.Responses.Kpi;
using DSLNG.PEAR.Services.Responses.Pillar;
using DSLNG.PEAR.Services.Responses.PmsSummary;
using System.Data.Entity;
using NCalc;
using PeriodeType = DSLNG.PEAR.Data.Enums.PeriodeType;

namespace DSLNG.PEAR.Services
{
    public class PmsSummaryService : BaseService, IPmsSummaryService
    {
        public PmsSummaryService(IDataContext dataContext)
            : base(dataContext)
        {
        }

        public GetPmsSummaryResponse GetPmsSummary(GetPmsSummaryRequest request)
        {
            var response = new GetPmsSummaryResponse();
            try
            {
                //var xxx = DataContext.PmsSummaries.Include(x => x.PmsSummaryScoringIndicators.Select(a => a.)).ToList();
                var pmsSummary = DataContext.PmsSummaries
                                            .Include(x => x.ScoreIndicators)
                                            .Include("PmsConfigs.Pillar")
                                            .Include("PmsConfigs.ScoreIndicators")
                                            .Include("PmsConfigs.PmsConfigDetailsList.Kpi.Measurement")
                                            .Include("PmsConfigs.PmsConfigDetailsList.Kpi.KpiAchievements")
                                            .Include("PmsConfigs.PmsConfigDetailsList.Kpi.KpiTargets")
                                            .Include("PmsConfigs.PmsConfigDetailsList.ScoreIndicators")
                                            .First(x => x.IsActive && x.Year == request.Year);

                var totalScoreScoringIndicators =
                    pmsSummary.ScoreIndicators;

                foreach (var pmsConfig in pmsSummary.PmsConfigs)
                {
                    foreach (var pmsConfigDetails in pmsConfig.PmsConfigDetailsList)
                    {
                        var kpiData = new GetPmsSummaryResponse.KpiData();
                        kpiData.Id = pmsConfigDetails.Id;
                        kpiData.Pillar = pmsConfig.Pillar.Name;
                        kpiData.PillarId = pmsConfig.Pillar.Id;
                        kpiData.Kpi = pmsConfigDetails.Kpi.Name;
                        kpiData.Unit = pmsConfigDetails.Kpi.Measurement.Name;
                        kpiData.Weight = pmsConfigDetails.Weight;
                        kpiData.PillarOrder = pmsConfigDetails.Kpi.Pillar.Order;
                        kpiData.KpiOrder = pmsConfigDetails.Kpi.Order;
                        kpiData.PillarWeight = pmsConfig.Weight;

                        #region KPI Achievement

                        var kpiAchievementYearly =
                            pmsConfigDetails.Kpi.KpiAchievements.FirstOrDefault(x => x.PeriodeType == PeriodeType.Yearly);
                        if (kpiAchievementYearly != null && kpiAchievementYearly.Value != null)
                            kpiData.ActualYearly = kpiAchievementYearly.Value.Value;


                        var kpiAchievementMonthly =
                            pmsConfigDetails.Kpi.KpiAchievements.FirstOrDefault(
                                x => x.PeriodeType == PeriodeType.Monthly && x.Periode.Month == request.Month);
                        if (kpiAchievementMonthly != null && kpiAchievementMonthly.Value.HasValue)
                            kpiData.ActualMonthly = kpiAchievementMonthly.Value.Value;


                        var kpiAchievementYtd = pmsConfigDetails.Kpi.KpiAchievements.Where(
                            x =>
                            x.PeriodeType == PeriodeType.Monthly && x.Value.HasValue &&
                            (x.Periode.Month >= 1 && x.Periode.Month <= request.Month)).ToList();
                        if (kpiAchievementYtd.Count > 0) kpiData.ActualYtd = 0;
                        foreach (var achievementYtd in kpiAchievementYtd)
                        {
                            if (achievementYtd.Value.HasValue)
                                kpiData.ActualYtd += achievementYtd.Value;
                        }

                        #endregion

                        #region KPI Target

                        var kpiTargetYearly =
                            pmsConfigDetails.Kpi.KpiTargets.FirstOrDefault(x => x.PeriodeType == PeriodeType.Yearly);
                        if (kpiTargetYearly != null && kpiTargetYearly.Value != null)
                            kpiData.TargetYearly = kpiTargetYearly.Value.Value;


                        var kpiTargetMonthly =
                            pmsConfigDetails.Kpi.KpiTargets.FirstOrDefault(
                                x => x.PeriodeType == PeriodeType.Monthly && x.Periode.Month == request.Month);
                        if (kpiTargetMonthly != null && kpiTargetMonthly.Value.HasValue)
                            kpiData.TargetMonthly = kpiTargetMonthly.Value.Value;


                        var kpiTargetYtd = pmsConfigDetails.Kpi.KpiTargets.Where(
                            x =>
                            x.PeriodeType == PeriodeType.Monthly && x.Value.HasValue &&
                            (x.Periode.Month >= 1 && x.Periode.Month <= request.Month)).ToList();
                        if (kpiTargetYtd.Count > 0) kpiData.TargetYtd = 0;
                        foreach (var targetYtd in kpiTargetYtd)
                        {
                            if (targetYtd.Value.HasValue)
                                kpiData.TargetYtd += targetYtd.Value;
                        }

                        #endregion

                        #region Score

                        if (kpiData.ActualYtd.HasValue && kpiData.TargetYtd.HasValue)
                        {
                            var indexYtd = (kpiData.ActualYtd.Value/kpiData.TargetYtd.Value);

                            switch (pmsConfigDetails.ScoringType)
                            {
                                case ScoringType.Positive:
                                    kpiData.Score = pmsConfigDetails.Weight*indexYtd;
                                    break;
                                case ScoringType.Negative:
                                    if (indexYtd == 0)
                                    {
                                        response.IsSuccess = false;
                                        response.Message =
                                            string.Format(
                                                @"KPI {0} memiliki nilai index YTD 0 dengan Nilai Scoring Type negative yang mengakibatkan terjadinya nilai infinity",
                                                pmsConfigDetails.Kpi.Name);
                                        return response;
                                    }
                                    kpiData.Score = pmsConfigDetails.Weight/indexYtd;
                                    break;
                                case ScoringType.Boolean:
                                    bool isMoreThanZero = false;
                                    var kpiAchievement =
                                        pmsConfigDetails.Kpi.KpiAchievements.Where(x => x.Value.HasValue).ToList();
                                    bool isNull = kpiAchievement.Count == 0;
                                    foreach (var achievement in kpiAchievement)
                                    {
                                        if (achievement.Value > 0)
                                            isMoreThanZero = true;
                                    }

                                    if (!isNull)
                                    {
                                        kpiData.Score = isMoreThanZero ? 0 : Double.Parse(kpiData.Weight.ToString());
                                    }

                                    break;
                            }

                        }

                        #endregion

                        kpiData.KpiColor = GetScoreColor(kpiData.Score, pmsConfigDetails.ScoreIndicators);

                        response.KpiDatas.Add(kpiData);
                    }

                    response.KpiDatas = SetPmsConfigColor(response.KpiDatas, pmsConfig.ScoreIndicators,
                                                          pmsConfig.Pillar.Id);
                }

                response.KpiDatas = SetPmsSummaryColor(response.KpiDatas, pmsSummary.ScoreIndicators);
                response.IsSuccess = true;
            }
            catch (InvalidOperationException invalidOperationException)
            {
                response.Message = invalidOperationException.Message;
            }
            catch (NullReferenceException nullReferenceException)
            {
                response.Message = nullReferenceException.Message;
            }

            return response;
        }

        private IList<GetPmsSummaryResponse.KpiData> SetPmsConfigColor(IList<GetPmsSummaryResponse.KpiData> kpiDatas, ICollection<ScoreIndicator> scoreIndicators, int pillarId)
        {
            var data = kpiDatas.Where(x => x.PillarId == pillarId && x.Score.HasValue).ToList();
            double? totalScore = null;
            if (data.Count > 0)
            {
                totalScore = 0;
                foreach (var datum in data)
                {
                    //totalScore += datum.Score/100 * datum.PillarWeight;
                    totalScore += datum.Score;
                }
            }

            var groupedPillar = kpiDatas.Where(x => x.PillarId == pillarId).ToList();
            foreach (var item in groupedPillar)
            {
                item.PillarColor = GetScoreColor(totalScore, scoreIndicators);
            }

            return kpiDatas;
        }

        private IList<GetPmsSummaryResponse.KpiData> SetPmsSummaryColor(IList<GetPmsSummaryResponse.KpiData> kpiDatas, ICollection<ScoreIndicator> scoreIndicators)
        {
            var groupedPillars = kpiDatas.GroupBy(x => x.Pillar);
            double? totalScore = null;
            foreach (var groupedPillar in groupedPillars)
            {
                var notNullPillar = groupedPillar.Where(x => x.Score.HasValue).ToList();
                if (notNullPillar.Count > 0)
                    totalScore = totalScore.HasValue ? totalScore.Value : 0;

                foreach (var item in notNullPillar)
                {
                    if (item.Score.HasValue)
                    {
                        totalScore += item.Score.Value/100 * item.PillarWeight;
                    }
                }
            }

            return kpiDatas.Select(x =>
            {
                x.TotalScoreColor = GetScoreColor(totalScore, scoreIndicators);
                return x;
            }).ToList();
        }

        public GetPmsSummaryListResponse GetPmsSummaryList(GetPmsSummaryListRequest request)
        {
            var response = new GetPmsSummaryListResponse();
            try
            {
                var summaries = DataContext.PmsSummaries.ToList();
                response.PmsSummaryList = summaries.MapTo<GetPmsSummaryListResponse.PmsSummary>();
                response.IsSuccess = true;
            }
            catch (ArgumentNullException exception)
            {
                response.Message = exception.Message;
            }

            return response;
        }

        public GetPmsSummaryConfigurationResponse GetPmsSummaryConfiguration(GetPmsSummaryConfigurationRequest request)
        {
            var response = new GetPmsSummaryConfigurationResponse();
            try
            {
                var pmsSummary = DataContext.PmsSummaries
                    .Include(x => x.PmsConfigs.Select(y => y.PmsConfigDetailsList.Select(z => z.ScoreIndicators)))
                    .First(x => x.Id == request.Id);

                response.Pillars = DataContext.Pillars.ToList().MapTo<GetPmsSummaryConfigurationResponse.Pillar>();
                response.Kpis = DataContext.Kpis.Include(x => x.Measurement).ToList().MapTo<GetPmsSummaryConfigurationResponse.Kpi>();
                response.PmsConfigs = pmsSummary.PmsConfigs.MapTo<GetPmsSummaryConfigurationResponse.PmsConfig>();

                response.IsSuccess = true;
            }
            catch (ArgumentNullException argumentNullException)
            {
                response.Message = argumentNullException.Message;
            }
            catch (InvalidOperationException invalidOperationException)
            {
                response.Message = invalidOperationException.Message;
            }

            return response;
        }

        public GetScoreIndicatorsResponse GetScoreIndicators(int pmsConfigDetailId)
        {
            var response = new GetScoreIndicatorsResponse();
            try
            {
                var pmsConfigDetails = DataContext.PmsConfigDetails
                    .Include(x => x.ScoreIndicators)
                    .First(x => x.Id == pmsConfigDetailId);
                response.ScoreIndicators =
                    pmsConfigDetails.ScoreIndicators.MapTo<GetScoreIndicatorsResponse.ScoreIndicator>();
                response.IsSuccess = true;
            }
            catch (ArgumentNullException argumentNullException)
            {
                response.Message = argumentNullException.Message;
            }
            catch (InvalidOperationException invalidOperationException)
            {
                response.Message = invalidOperationException.Message;
            }

            return response;
        }

        public GetPmsDetailsResponse GetPmsDetails(GetPmsDetailsRequest request)
        {
            var response = new GetPmsDetailsResponse();
            try
            {
                var config = DataContext.PmsConfigDetails
                                        .Include(x => x.PmsConfig.ScoreIndicators)
                                        .Include(x => x.PmsConfig.PmsSummary)
                                        .Include(x => x.Kpi)
                                        .Include(x => x.Kpi.Group)
                                        .Include(x => x.Kpi.KpiAchievements)
                                        .Include(x => x.Kpi.Measurement)
                                        .Include(x => x.Kpi.RelationModels)
                                        .Include(x => x.Kpi.RelationModels.Select(y => y.Kpi))
                                        .Include(
                                            x => x.Kpi.RelationModels.Select(y => y.Kpi).Select(z => z.KpiAchievements))
                                        .Include(x => x.Kpi.RelationModels.Select(y => y.Kpi).Select(z => z.Measurement))
                                        .FirstOrDefault(x => x.Id == request.Id);

                if (config != null)
                {
                    response.Title = config.PmsConfig.PmsSummary.Title;
                    response.Year = config.PmsConfig.PmsSummary.Year;
                    response.KpiGroup = config.Kpi.Group != null ? config.Kpi.Group.Name : "";
                    response.KpiName = config.Kpi.Name;
                    response.KpiUnit = config.Kpi.Measurement != null ? config.Kpi.Measurement.Name : "";
                    response.KpiPeriod = config.Kpi.Period.ToString();
                    response.ScoreIndicators =
                        config.ScoreIndicators.MapTo<GetPmsDetailsResponse.ScoreIndicator>();
                    response.Weight = config.Weight;
                    response.ScoringType = config.ScoringType.ToString();
                    var kpiActualYearly =
                        config.Kpi.KpiAchievements.FirstOrDefault(x => x.PeriodeType == Data.Enums.PeriodeType.Yearly);
                    if (kpiActualYearly != null)
                    {
                        response.KpiActualYearly = kpiActualYearly.Value;
                        response.KpiPeriodYearly = kpiActualYearly.Periode.Year.ToString();
                        response.KpiTypeYearly = kpiActualYearly.PeriodeType.ToString();
                        response.KpiRemarkYearly = kpiActualYearly.Remark;
                    }
                    var kpiActualMonthly =
                        config.Kpi.KpiAchievements.Where(x => x.PeriodeType == Data.Enums.PeriodeType.Monthly).ToList();
                    response.KpiAchievmentMonthly = new List<GetPmsDetailsResponse.KpiAchievment>();
                    if (kpiActualMonthly.Count > 0)
                    {
                        var kpiActualMonth = kpiActualMonthly.FirstOrDefault(x => x.Periode.Month == request.Month);
                        response.KpiActualMonthly = kpiActualMonth != null ? kpiActualMonth.Value : null;
                        response.KpiAchievmentMonthly =
                            kpiActualMonthly.MapTo<GetPmsDetailsResponse.KpiAchievment>();
                    }

                    response.KpiRelations = new List<GetPmsDetailsResponse.KpiRelation>();
                    var kpiRelationModel = config.Kpi.RelationModels;
                    if (kpiRelationModel != null)
                    {
                        foreach (var item in kpiRelationModel)
                        {
                            var actualYearly =
                                item.Kpi.KpiAchievements.FirstOrDefault(
                                    x => x.PeriodeType == Data.Enums.PeriodeType.Yearly);
                            var actualMonthly =
                                item.Kpi.KpiAchievements.Where(x => x.PeriodeType == Data.Enums.PeriodeType.Monthly)
                                    .ToList();
                            response.KpiRelations.Add(new GetPmsDetailsResponse.KpiRelation
                            {
                                Name = item.Kpi.Name,
                                Unit = item.Kpi.Measurement.Name,
                                Method = item.Method,
                                ActualYearly = actualYearly != null ? actualYearly.Value : null,
                                ActualMonthly = actualMonthly.Count > 0 ? actualMonthly.Sum(x => x.Value) : null
                            });
                        }
                    }
                }

                response.IsSuccess = true;
            }
            catch (ArgumentNullException argumentNullException)
            {
                response.Message = argumentNullException.Message;
            }


            return response;
        }

        public GetPmsConfigDetailsResponse GetPmsConfigDetails(int id)
        {
            var response = new GetPmsConfigDetailsResponse();
            try
            {
                var pmsConfigDetails =
                    DataContext.PmsConfigDetails
                    .Include(x => x.ScoreIndicators)
                    .Include(x => x.Kpi.Pillar)
                    .First(x => x.Id == id);
                response = pmsConfigDetails.MapTo<GetPmsConfigDetailsResponse>();
                response.Pillars = DataContext.Pillars.ToList().MapTo<GetPmsConfigDetailsResponse.Pillar>();
                response.Kpis = DataContext.Kpis
                    .Include(x => x.Level)
                    .Include(x => x.Pillar)
                    .Where(x => x.Level.Code == "COR").ToList()
                    .MapTo<GetPmsConfigDetailsResponse.Kpi>();
                response.IsSuccess = true;
            }
            catch (ArgumentNullException argumentNullException)
            {
                response.Message = argumentNullException.Message;
            }
            catch (InvalidOperationException invalidOperationException)
            {
                response.Message = invalidOperationException.Message;
            }

            return response;
        }

        public GetKpisByPillarIdResponse GetKpis(int pillarId)
        {
            var response = new GetKpisByPillarIdResponse();
            try
            {
                var kpis = DataContext.Kpis.Include(x => x.Pillar).Where(x => x.Pillar.Id == pillarId).ToList();
                response.Kpis = kpis.MapTo<GetKpisByPillarIdResponse.Kpi>();
                response.IsSuccess = true;
                return response;
            }
            catch (ArgumentNullException argumentNullException)
            {
                response.Message = argumentNullException.Message;
            }

            return response;
        }

        private string GetScoreColor(double? score, IEnumerable<ScoreIndicator> scoreIndicators)
        {
            if (score.HasValue)
            {
                foreach (var scoreIndicator in scoreIndicators)
                {
                    Expression e = new Expression(scoreIndicator.Expression.Replace("x", score.ToString()));
                    bool isPassed = (bool)e.Evaluate();
                    if (isPassed)
                    {
                        return scoreIndicator.Color;
                    }
                }
            }

            return "grey";
        }

        private IList<GetPmsSummaryResponse.KpiData> SetPillarAndTotalScoreColor(IList<GetPmsSummaryResponse.KpiData> kpiDatas, PmsSummaryScoringIndicator pillarScoringIndicators, PmsSummaryScoringIndicator totalScoreScoringIndicators)
        {
            IDictionary<string, double?[]> totalPillar = new Dictionary<string, double?[]>();
            var groupedPillars = kpiDatas.GroupBy(x => x.Pillar);
            foreach (var groupedPillar in groupedPillars)
            {
                double? totalScore = null;
                var notNullPillar = groupedPillar.Where(x => x.Score.HasValue).ToList();
                if (notNullPillar.Count > 0)
                    totalScore = 0;

                foreach (var item in notNullPillar)
                {
                    if (item.Score.HasValue)
                    {
                        totalScore += item.Score.Value;
                    }
                }

                totalPillar.Add(groupedPillar.Key, new double?[] { totalScore, groupedPillar.First().PillarWeight });
            }

            double? allTotalScore = null;
            if (totalPillar.Count > 0)
                allTotalScore = 0;

            foreach (var tp in totalPillar)
            {
                if (tp.Value[0].HasValue && tp.Value[1].HasValue)
                {
                    allTotalScore += tp.Value[0] / 100 * tp.Value[1];
                }
                var kpiWithPillars = kpiDatas.Where(x => x.Pillar == tp.Key).ToList();
                foreach (var kpiWithPillar in kpiWithPillars)
                {
                    kpiWithPillar.PillarColor = GetScoreColor(tp.Value[0], pillarScoringIndicators.ScoreIndicators);
                }
            }

            return kpiDatas.Select(x =>
                {
                    x.TotalScoreColor = GetScoreColor(allTotalScore, totalScoreScoringIndicators.ScoreIndicators);
                    return x;
                }).ToList();
        }
    }
}