﻿

namespace DSLNG.PEAR.Services.Requests.Artifact
{
    public class GetArtifactsRequest
    {
        public int Take { get; set; }
        public int Skip { get; set; }
        public bool OnlyCount { get; set; }
    }
}
