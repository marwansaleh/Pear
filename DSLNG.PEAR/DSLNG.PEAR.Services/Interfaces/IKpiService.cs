﻿using DSLNG.PEAR.Services.Requests.Kpi;
using DSLNG.PEAR.Services.Responses.Kpi;


namespace DSLNG.PEAR.Services.Interfaces
{
    public interface IKpiService
    {
        GetKpiResponse GetBy(GetKpiRequest request);
        GetKpiToSeriesResponse GetKpiToSeries(GetKpiToSeriesRequest request);

        GetKpiResponse GetKpi(GetKpiRequest request);
        GetKpisResponse GetKpis(GetKpisRequest request);
        CreateKpiResponse Create(CreateKpiRequest request);
        UpdateKpiResponse Update(UpdateKpiRequest request);
        DeleteKpiResponse Delete(int id);
    }
}
