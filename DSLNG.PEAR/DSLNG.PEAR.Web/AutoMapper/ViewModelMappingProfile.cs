﻿using System.Collections.Generic;
using System.Web.Mvc;
using AutoMapper;
using DSLNG.PEAR.Services.Requests.Measurement;
using DSLNG.PEAR.Services.Responses.Level;
using DSLNG.PEAR.Services.Responses.Measurement;
using DSLNG.PEAR.Services.Responses.PmsSummary;
using DSLNG.PEAR.Services.Responses.Kpi;
using DSLNG.PEAR.Services.Requests.Kpi;
using DSLNG.PEAR.Web.ViewModels.CorporatePortofolio;
using DSLNG.PEAR.Web.ViewModels.Kpi;
using DSLNG.PEAR.Services.Responses.Menu;
using DSLNG.PEAR.Services.Requests.Menu;
using DSLNG.PEAR.Web.ViewModels.Level;
using DSLNG.PEAR.Web.ViewModels.Measurement;
using DSLNG.PEAR.Web.ViewModels.Menu;
using DSLNG.PEAR.Services.Requests.Level;
using DSLNG.PEAR.Services.Requests.User;
using DSLNG.PEAR.Services.Responses.User;
using DSLNG.PEAR.Web.ViewModels.PmsSummary;
using DSLNG.PEAR.Web.ViewModels.User;
using DSLNG.PEAR.Web.ViewModels.RoleGroup;
using DSLNG.PEAR.Services.Responses.RoleGroup;
using DSLNG.PEAR.Services.Requests.RoleGroup;
using DSLNG.PEAR.Web.ViewModels.Type;
using DSLNG.PEAR.Services.Responses.Type;
using DSLNG.PEAR.Services.Requests.Type;
using DSLNG.PEAR.Services.Responses.Pillar;
using DSLNG.PEAR.Services.Requests.Pillar;
using DSLNG.PEAR.Web.ViewModels.Pillar;
using DSLNG.PEAR.Web.ViewModels.Artifact;
using DSLNG.PEAR.Services.Requests.Artifact;
using System;
using EPeriodeType = DSLNG.PEAR.Data.Enums.PeriodeType;
using DSLNG.PEAR.Data.Enums;
using DSLNG.PEAR.Common.Extensions;
using DSLNG.PEAR.Services.Responses.Artifact;
using System.Linq;
using DSLNG.PEAR.Services.Responses.Group;
using DSLNG.PEAR.Services.Requests.Group;
using DSLNG.PEAR.Web.ViewModels.Group;
using DSLNG.PEAR.Services.Responses.Method;
using DSLNG.PEAR.Web.ViewModels.Method;
using DSLNG.PEAR.Services.Requests.Method;
using DSLNG.PEAR.Services.Requests.Periode;
using DSLNG.PEAR.Web.ViewModels.Periode;
using DSLNG.PEAR.Services.Responses.Periode;
using DSLNG.PEAR.Web.ViewModels.KpiTarget;
using DSLNG.PEAR.Services.Requests.KpiTarget;
using DSLNG.PEAR.Services.Requests.Conversion;
using DSLNG.PEAR.Services.Responses.Conversion;
using DSLNG.PEAR.Web.ViewModels.Conversion;
using DSLNG.PEAR.Services.Responses.KpiTarget;

namespace DSLNG.PEAR.Web.AutoMapper
{
    public class ViewModelMappingProfile : Profile
    {
        protected override void Configure()
        {
            ConfigureCorporatePortofolio();
            ConfigurePmsSummary();
            ConfigureKpiTarget();
            Mapper.CreateMap<SearchKpiViewModel, GetKpiToSeriesRequest>();
            Mapper.CreateMap<GetKpiToSeriesResponse, KpiToSeriesViewModel>();
            Mapper.CreateMap<CreateKpiViewModel, CreateKpiRequest>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.KpiRelationModel, DSLNG.PEAR.Services.Requests.Kpi.KpiRelationModel>();
            Mapper.CreateMap<GetKpiResponse, UpdateKpiViewModel>();
            Mapper.CreateMap<UpdateKpiViewModel, UpdateKpiRequest>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.Level, DSLNG.PEAR.Services.Requests.Kpi.Level>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.RoleGroup, DSLNG.PEAR.Services.Requests.Kpi.RoleGroup>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.Group, DSLNG.PEAR.Services.Requests.Kpi.Group>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.Measurement, DSLNG.PEAR.Services.Requests.Kpi.Measurement>();
            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.Kpi.Type, DSLNG.PEAR.Services.Requests.Kpi.Type>();

            //Mapper.CreateMap<GetMenusResponse.Menu, MenuViewModel>();
            Mapper.CreateMap<CreateMenuViewModel, CreateMenuRequest>();
            Mapper.CreateMap<GetMenuResponse, UpdateMenuViewModel>()
                .ForMember(x => x.RoleGroupIds, o => o.MapFrom(k => k.RoleGroups.Select(x => x.Id).ToList()));
            Mapper.CreateMap<UpdateMenuViewModel, UpdateMenuRequest>();

            Mapper.CreateMap<CreateMeasurementViewModel, CreateMeasurementRequest>();
            Mapper.CreateMap<GetMeasurementResponse, UpdateMeasurementViewModel>();
            Mapper.CreateMap<UpdateMeasurementViewModel, UpdateMeasurementRequest>();
            Mapper.CreateMap<GetMeasurementsResponse.Measurement, MeasurementViewModel>();
            Mapper.CreateMap<GetMeasurementResponse, DSLNG.PEAR.Web.ViewModels.Kpi.Measurement>();

            Mapper.CreateMap<CreateLevelViewModel, CreateLevelRequest>();
            Mapper.CreateMap<GetLevelResponse, UpdateLevelViewModel>();
            Mapper.CreateMap<UpdateLevelViewModel, UpdateLevelRequest>();

            Mapper.CreateMap<CreateUserViewModel, CreateUserRequest>();
            Mapper.CreateMap<GetUserResponse, UpdateUserViewModel>();
            Mapper.CreateMap<UpdateUserViewModel, UpdateUserRequest>();
            Mapper.CreateMap<GetUsersResponse.User, UserViewModel>()
                .ForMember(x => x.RoleName, y => y.MapFrom(z => z.Role.Name));

            Mapper.CreateMap<GetRoleGroupsResponse.RoleGroup, RoleGroupViewModel>();
            Mapper.CreateMap<CreateRoleGroupViewModel, CreateRoleGroupRequest>();
            Mapper.CreateMap<GetRoleGroupResponse, UpdateRoleGroupViewModel>()
                .ForMember(o => o.LevelId, p => p.MapFrom(k => k.Level.Id));
            Mapper.CreateMap<UpdateRoleGroupViewModel, UpdateRoleGroupRequest>();
            Mapper.CreateMap<GetRoleGroupResponse, DSLNG.PEAR.Web.ViewModels.Kpi.RoleGroup>();

            Mapper.CreateMap<GetTypeResponse, UpdateTypeViewModel>();
            Mapper.CreateMap<GetTypesResponse.Type, TypeViewModel>();
            Mapper.CreateMap<CreateTypeViewModel, CreateTypeRequest>();
            Mapper.CreateMap<UpdateTypeViewModel, UpdateTypeRequest>();
            Mapper.CreateMap<GetTypeResponse, DSLNG.PEAR.Web.ViewModels.Kpi.Type>();

            Mapper.CreateMap<CreatePillarViewModel, CreatePillarRequest>();
            Mapper.CreateMap<GetPillarResponse, UpdatePillarViewModel>();
            Mapper.CreateMap<UpdatePillarViewModel, UpdatePillarRequest>();
            Mapper.CreateMap<GetPillarsResponse, DSLNG.PEAR.Web.ViewModels.Kpi.Pillar>();

            Mapper.CreateMap<CreateMethodViewModel, CreateMethodRequest>();
            Mapper.CreateMap<GetMethodRequest, UpdateMethodViewModel>();
            Mapper.CreateMap<UpdateMethodRequest, UpdateMethodViewModel>();
            Mapper.CreateMap<GetMethodResponse, UpdateMethodViewModel>();
            Mapper.CreateMap<UpdateMethodViewModel, UpdateMethodRequest>();

            //cartesian preview
            Mapper.CreateMap<ArtifactDesignerViewModel, GetCartesianChartDataRequest>()
                .ForMember(x => x.PeriodeType, o => o.MapFrom(s => Enum.Parse(typeof(EPeriodeType), s.PeriodeType)))
                .ForMember(x => x.RangeFilter, o => o.MapFrom(s => Enum.Parse(typeof(RangeFilter), s.RangeFilter)))
                .ForMember(x => x.ValueAxis, o => o.MapFrom(s => Enum.Parse(typeof(ValueAxis), s.ValueAxis)));
            
            //bar chart mapping
            Mapper.CreateMap<BarChartViewModel, GetCartesianChartDataRequest>();
            Mapper.CreateMap<BarChartViewModel.SeriesViewModel, GetCartesianChartDataRequest.SeriesRequest>();
            Mapper.CreateMap<BarChartViewModel.StackViewModel, GetCartesianChartDataRequest.StackRequest>();
            Mapper.CreateMap<GetCartesianChartDataResponse.SeriesResponse, BarChartDataViewModel.SeriesViewModel>();
            
            //line chart mapping
            Mapper.CreateMap<LineChartViewModel, GetCartesianChartDataRequest>();
            Mapper.CreateMap<LineChartViewModel.SeriesViewModel, GetCartesianChartDataRequest.SeriesRequest>();
            Mapper.CreateMap<GetCartesianChartDataResponse.SeriesResponse, LineChartDataViewModel.SeriesViewModel>();

            Mapper.CreateMap<BarChartViewModel.SeriesViewModel, GetSeriesRequest.Series>()
                .ForMember(x => x.Stacks, o => o.MapFrom(s => s.Stacks.MapTo<GetSeriesRequest.Stack>()));
            Mapper.CreateMap<BarChartViewModel.StackViewModel, GetSeriesRequest.Stack>();
            Mapper.CreateMap<GetSeriesResponse.SeriesResponse, BarChartDataViewModel.SeriesViewModel>();

            Mapper.CreateMap<GetGroupResponse, DSLNG.PEAR.Web.ViewModels.Kpi.Group>();

            Mapper.CreateMap<GetMethodResponse, DSLNG.PEAR.Web.ViewModels.Kpi.Method>();

            Mapper.CreateMap<BarChartViewModel.SeriesViewModel, GetCartesianChartDataRequest.SeriesRequest>()
                .ForMember(x => x.Stacks, o => o.MapFrom(s => s.Stacks.MapTo<GetCartesianChartDataRequest.StackRequest>()));
            Mapper.CreateMap<BarChartViewModel.StackViewModel, GetCartesianChartDataRequest.StackRequest>();
            

            Mapper.CreateMap<SpeedometerChartViewModel, GetSpeedometerChartDataRequest>()
                .ForMember(x => x.PeriodeType, o => o.MapFrom(s => Enum.Parse(typeof(EPeriodeType), s.PeriodeType)))
                .ForMember(x => x.RangeFilter, o => o.MapFrom(s => Enum.Parse(typeof(RangeFilter), s.RangeFilter)))
                .ForMember(x => x.ValueAxis, o => o.MapFrom(s => Enum.Parse(typeof(ValueAxis), s.ValueAxis)))
                .ForMember(x => x.Series, o => o.MapFrom(s => s.Series.MapTo<GetSpeedometerChartDataRequest.SeriesRequest>()))
                .ForMember(x => x.PlotBands, o => o.MapFrom(s => s.PlotBands.MapTo<GetSpeedometerChartDataRequest.PlotBandRequest>()));

            Mapper.CreateMap<SpeedometerChartViewModel.SeriesViewModel, GetSpeedometerChartDataRequest.SeriesRequest>();
            Mapper.CreateMap<SpeedometerChartViewModel.PlotBand, GetSpeedometerChartDataRequest.PlotBandRequest>();
            Mapper.CreateMap<GetSpeedometerChartDataResponse.SeriesResponse, SpeedometerChartDataViewModel.SeriesViewModel>()
                .ForMember(x => x.data, o => o.MapFrom(s => new List<double> { s.data }));
            Mapper.CreateMap<GetSpeedometerChartDataResponse.PlotBandResponse, SpeedometerChartDataViewModel.PlotBandViewModel>();
            Mapper.CreateMap<CreateGroupViewModel, CreateGroupRequest>();
            Mapper.CreateMap<GetGroupResponse, UpdateGroupViewModel>();
            Mapper.CreateMap<UpdateGroupViewModel, UpdateGroupRequest>();

            Mapper.CreateMap<CreatePeriodeViewModel, CreatePeriodeRequest>();
            Mapper.CreateMap<GetPeriodeResponse, UpdatePeriodeViewModel>();
            Mapper.CreateMap<UpdatePeriodeViewModel, UpdatePeriodeRequest>();

            Mapper.CreateMap<ArtifactDesignerViewModel, CreateArtifactRequest>()
                .ForMember(x => x.PeriodeType, o => o.MapFrom(s => Enum.Parse(typeof(EPeriodeType), s.PeriodeType)))
                .ForMember(x => x.RangeFilter, o => o.MapFrom(s => Enum.Parse(typeof(RangeFilter), s.RangeFilter)))
                .ForMember(x => x.ValueAxis, o => o.MapFrom(s => Enum.Parse(typeof(ValueAxis), s.ValueAxis)));

            Mapper.CreateMap<BarChartViewModel, CreateArtifactRequest>()
                .ForMember(x => x.Series, o => o.MapFrom(s => s.Series.MapTo<CreateArtifactRequest.SeriesRequest>()));
            Mapper.CreateMap<LineChartViewModel, CreateArtifactRequest>()
                .ForMember(x => x.Series, o => o.MapFrom(s => s.Series.MapTo<CreateArtifactRequest.SeriesRequest>()));
            Mapper.CreateMap<SpeedometerChartViewModel, CreateArtifactRequest>()
                .ForMember(x => x.Series, o => o.MapFrom(s => new List<CreateArtifactRequest.SeriesRequest> { s.Series.MapTo<CreateArtifactRequest.SeriesRequest>() }))
                .ForMember(x => x.Plots, o => o.MapFrom(s => s.PlotBands.MapTo<CreateArtifactRequest.PlotRequest>()));

            Mapper.CreateMap<BarChartViewModel.SeriesViewModel, CreateArtifactRequest.SeriesRequest>()
                .ForMember(x => x.Stacks, o => o.MapFrom(s => s.Stacks.MapTo<CreateArtifactRequest.StackRequest>()));
            Mapper.CreateMap<BarChartViewModel.StackViewModel, CreateArtifactRequest.StackRequest>();
            Mapper.CreateMap<LineChartViewModel.SeriesViewModel, CreateArtifactRequest.SeriesRequest>();
            Mapper.CreateMap<SpeedometerChartViewModel.SeriesViewModel, CreateArtifactRequest.SeriesRequest>();
            Mapper.CreateMap<SpeedometerChartViewModel.PlotBand, CreateArtifactRequest.PlotRequest>();

            Mapper.CreateMap<GetArtifactResponse, GetCartesianChartDataRequest>()
                .ForMember(x => x.Series, o => o.MapFrom(s => s.Series.MapTo<GetCartesianChartDataRequest.SeriesRequest>()));
            Mapper.CreateMap<GetArtifactResponse.SeriesResponse, GetCartesianChartDataRequest.SeriesRequest>()
                .ForMember(x => x.Stacks, o => o.MapFrom(s => s.Stacks.MapTo<GetCartesianChartDataRequest.StackRequest>()));
            Mapper.CreateMap<GetArtifactResponse.StackResponse, GetCartesianChartDataRequest.StackRequest>();

            Mapper.CreateMap<GetArtifactResponse, GetSpeedometerChartDataRequest>()
             .ForMember(x => x.PlotBands, o => o.MapFrom(s => s.PlotBands.MapTo<GetSpeedometerChartDataRequest.PlotBandRequest>()))
             .ForMember(x => x.Series, o => o.MapFrom(s => s.Series[0]));
            Mapper.CreateMap<GetArtifactResponse.PlotResponse, GetSpeedometerChartDataRequest.PlotBandRequest>();
            Mapper.CreateMap<GetArtifactResponse.SeriesResponse, GetSpeedometerChartDataRequest.SeriesRequest>();

            Mapper.CreateMap<DSLNG.PEAR.Web.ViewModels.KpiTarget.KpiTarget, CreateKpiTargetRequest.KpiTarget>();

            Mapper.CreateMap<CreateConversionViewModel, CreateConversionRequest>();
            Mapper.CreateMap<GetConversionResponse, UpdateConversionViewModel>()
                .ForMember(x => x.MeasurementFrom, o => o.MapFrom(k => k.From.Id))
                .ForMember(x => x.MeasurementTo, o => o.MapFrom(k => k.To.Id));
            Mapper.CreateMap<UpdateConversionViewModel, UpdateConversionRequest>();
            base.Configure();
        }

        private void ConfigureCorporatePortofolio()
        {
            Mapper.CreateMap<GetPmsSummaryListResponse.PmsSummary, IndexCorporatePortofolioViewModel.CorporatePortofolio>();
            Mapper.CreateMap<GetPmsSummaryConfigurationResponse.PmsConfig, PmsSummaryConfigurationViewModel.PmsConfig>();
            Mapper.CreateMap<GetPmsSummaryConfigurationResponse.PmsConfigDetails, PmsSummaryConfigurationViewModel.PmsConfigDetails>()
                .ForMember(x => x.KpiId, y => y.MapFrom(z => z.Kpi.Id))
                .ForMember(x => x.KpiName, y => y.MapFrom(z => z.Kpi.Name))
                .ForMember(x => x.KpiMeasurement, y => y.MapFrom(z => z.Kpi.Measurement))
                .ForMember(x => x.ScoringType, y => y.MapFrom(z => z.ScoringType.ToString()));

            Mapper.CreateMap<GetPmsSummaryConfigurationResponse, PmsSummaryConfigurationViewModel>()
                  .ForMember(x => x.Kpis, y => y.MapFrom(z => z.Kpis.Select(a => new SelectListItem
                      {
                          Text = a.Name,
                          Value = a.Id.ToString()
                      })))
                  .ForMember(x => x.Pillars, y => y.MapFrom(z => z.Pillars.Select(a => new SelectListItem
                      {
                          Text = a.Name,
                          Value = a.Id.ToString()
                      })));

            Mapper
                .CreateMap
                <GetPmsSummaryConfigurationResponse.ScoreIndicator, PmsSummaryConfigurationViewModel.ScoreIndicator>();

            Mapper.CreateMap<GetScoreIndicatorsResponse, DialogScoreIndicatorViewModel>();
            Mapper.CreateMap<GetScoreIndicatorsResponse.ScoreIndicator, ScoreIndicatorViewModel>();
            Mapper.CreateMap<GetPmsDetailsResponse.ScoreIndicator, ScoreIndicatorViewModel>();

            Mapper.CreateMap<GetPmsConfigDetailsResponse, DialogPmsConfigDetailViewModel>()
                .ForMember(x => x.ScoringTypes, y => y.MapFrom(z => new List<SelectListItem>
                      {
                          new SelectListItem {Text = ScoringType.Positive.ToString(), Value = ScoringType.Positive.ToString()},
                          new SelectListItem {Text = ScoringType.Negative.ToString(), Value = ScoringType.Negative.ToString()},
                          new SelectListItem {Text = ScoringType.Boolean.ToString(), Value = ScoringType.Boolean.ToString()}
                      }))
                  .ForMember(x => x.Pillars, y => y.MapFrom(z => z.Pillars.Select(x => new SelectListItem
                      {
                          Value = x.Id.ToString(),
                          Text = x.Name.ToString()
                      })))
                      .ForMember(x => x.Kpis, y => y.MapFrom(z => z.Kpis.Where(a => a.PillarId == z.PillarId)
                          .Select(x => new SelectListItem
                      {
                          Value = x.Id.ToString(),
                          Text = x.Name.ToString()
                      })));
            Mapper.CreateMap<GetPmsConfigDetailsResponse.ScoreIndicator, ScoreIndicatorViewModel>();

        }

        private void ConfigurePmsSummary()
        {
            Mapper.CreateMap<GetPmsSummaryResponse.KpiData, PmsSummaryViewModel>();
            Mapper.CreateMap<GetPmsDetailsResponse, PmsDetailsViewModel>();
            Mapper.CreateMap<GetPmsDetailsResponse.KpiAchievment, PmsDetailsViewModel.KpiAchievment>();
            Mapper.CreateMap<GetPmsDetailsResponse.KpiRelation, PmsDetailsViewModel.KpiRelation>();
        }

        private void ConfigureKpiTarget()
        {
            Mapper.CreateMap<GetPmsConfigsResponse.Kpi, Kpi>()
                .ForMember(k => k.Unit, o => o.MapFrom(k => k.Measurement.Name));
        }
    }
}