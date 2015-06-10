﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace DSLNG.PEAR.Model.Entities
{
    public class Activity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int Order { get; set; }
        public string Remark { get; set; }
        public bool IsActive { get; set; }
    }
}
