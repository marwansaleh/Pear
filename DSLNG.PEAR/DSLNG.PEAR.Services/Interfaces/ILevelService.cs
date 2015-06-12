﻿using DSLNG.PEAR.Data.Entities;
using DSLNG.PEAR.Services.Requests.Level;
using DSLNG.PEAR.Services.Responses.Level;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DSLNG.PEAR.Services.Interfaces
{
    public interface ILevelService
    {
        GetLevelResponse GetLevel(GetLevelRequest request);
        GetLevelsResponse GetLevels(GetLevelsRequest request);
    }
}
