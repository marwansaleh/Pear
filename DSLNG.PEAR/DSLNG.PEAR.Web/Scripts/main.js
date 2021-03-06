﻿// Common
String.prototype.startsWith = function (str) {
    return this.substr(0, str.length) === str;
};
String.prototype.endsWith = function (str) {
    return this.indexOf(str, this.length - str.length) !== -1;
};
String.prototype.isNullOrEmpty = function () {
    return this == false || this === '';
};

/**
 * Number.prototype.format(n, x)
 * 
 * @param integer n: length of decimal
 * @param integer x: length of sections
 */
Number.prototype.format = function (n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

(function (window, $, undefined) {
    var Pear = {};
    Pear.Artifact = {};
    Pear.Artifact.Designer = {};
    Pear.Template = {};
    Pear.Template.Editor = {};
    Pear.Loading = {};

    Pear.Loading.Show = function (container) {
        var loadingImage = $('#dataLayout').attr('data-content-url') + '/img/ajax-loader2.gif';
        container.css('background-position', 'center center');
        container.css('background-repeat', 'no-repeat');
        container.css('background-image', 'url(' + loadingImage + ')');
    };

    Pear.Loading.Stop = function(container) {
        container.css('background', 'none');
    };

    var artifactDesigner = Pear.Artifact.Designer;

    //helper
    artifactDesigner._formatKpi = function (kpi) {
        //console.log(kpi);
        if (kpi.loading) return kpi.text;
        return '<div class="clearfix"><div class="col-sm-12">' + kpi.Name + '</div></div>';
    };
    artifactDesigner._formatKpiSelection = function (kpi) {
        return kpi.Name || kpi.text;
    };
    artifactDesigner._kpiAutoComplete = function (context, useMeasurement) {
        var measurement = typeof useMeasurement == 'undefined' ? true : useMeasurement;
        //console.log(measurement);
        context.find('.kpi-list').select2({
            ajax: {
                url: $('#hidden-fields-holder').data('kpi-url'),
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    if (measurement) {
                        return {
                            term: params.term, // search term
                            measurementId: $('#MeasurementId').val()
                        };
                    } else {
                        return {
                            term: params.term, // search term
                        };
                    }
                },
                processResults: function (data, page) {
                    return data;
                },
                cache: true
            },
            escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
            minimumInputLength: 1,
            templateResult: Pear.Artifact.Designer._formatKpi, // omitted for brevity, see the source of this page
            templateSelection: Pear.Artifact.Designer._formatKpiSelection // omitted for brevity, see the source of this page
        });
    };
    artifactDesigner._colorPicker = function (context) {
        context.find('.colorpicker input').colpick({
            submit: 0,
            onChange: function (hsb, hex, rgb, el, bySetColor) {
                $(el).closest('.colorpicker').find('i').css('background-color', '#' + hex);
                if (!bySetColor) $(el).val('#' + hex);
            }
        }).keyup(function () {
            $(this).colpickSetColor(this.value.replace('#', ''));
        });
    };

    artifactDesigner.ListSetup = function () {
        $(document).on('click', '.artifact-view', function (e) {
            e.preventDefault();
            Pear.Loading.Show($('#container'));
            $('#graphic-preview').modal('show');
            var $this = $(this);
            var callback = Pear.Artifact.Designer._previewCallbacks;
            $.ajax({
                url: $this.attr('href'),
                method: 'GET',
                success: function (data) {
                    if (callback.hasOwnProperty(data.GraphicType)) {
                        Pear.Loading.Stop($('#container'));
                        callback[data.GraphicType](data, $('#container'));
                    }
                }
            });
            
            $('#graphic-preview').on('show.bs.modal', function () {
                $('#container').css('visibility', 'hidden');
            });
            
            $('#graphic-preview').on('shown.bs.modal', function () {
                if ($('#container').highcharts() !== undefined)
                    $('#container').highcharts().reflow();
                $('#container').css('visibility', 'visible');
            });
            
            $('#graphic-preview').on('hidden.bs.modal', function () {
                $('#container').html('');
            });
        });
    };
    artifactDesigner.GraphicSettingSetup = function () {
        var callback = Pear.Artifact.Designer._setupCallbacks;
        var loadGraph = function (url, type) {
            $.ajax({
                url: url,
                data: 'type=' + type,
                cache: true,
                method: 'GET',
                success: function (data) {
                    $('#graphic-settings').html(data);
                    var $hiddenFields = $('#hidden-fields');
                    $('#hidden-fields-holder').html($hiddenFields.html());
                    $hiddenFields.remove();
                    $('.graphic-properties').each(function (i, val) {
                        $(val).html('');
                    });
                    $('#graphic-settings').prev('.form-group').css('display', 'block');
                    $('#general-graphic-settings').css('display', 'block');
                    $('.form-measurement').css('display', 'block');
                    $('.main-value-axis').css('display', 'block');
                    if (callback.hasOwnProperty(type)) {
                        callback[type]();
                    }
                }
            });
        };
        var rangeDatePicker = function () {
            $('.datepicker').datetimepicker({
                format: "MM/DD/YYYY hh:00 A"
            });
            $('.datepicker').change(function (e) {
                //console.log(this);
            });
            $('#PeriodeType').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                var clearValue = $('.datepicker').each(function (i, val) {
                    $(val).val('');
                    $(val).data("DateTimePicker").destroy();
                });
                switch ($this.val().toLowerCase().trim()) {
                    case 'hourly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY hh:00 A"
                        });
                        break;
                    case 'daily':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY"
                        });
                        break;
                    case 'weekly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY",
                            daysOfWeekDisabled: [0, 2, 3, 4, 5, 6]
                        });
                        break;
                    case 'monthly':
                        $('.datepicker').datetimepicker({
                            format: "MM/YYYY"
                        });
                        break;
                    case 'yearly':
                        $('.datepicker').datetimepicker({
                            format: "YYYY"
                        });
                        break;
                    default:

                }
            });
        };
        var rangeControl = function () {
            $('#RangeFilter').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                $('#range-holder').prop('class', $this.val().toLowerCase().trim());
            });
            var original = $('#RangeFilter').clone(true);
            var rangeFilterSetup = function (periodeType) {
                var toRemove = {};
                toRemove.hourly = ['CurrentWeek', 'CurrentMonth', 'CurrentYear', 'YTD', 'MTD'];
                toRemove.daily = ['CurrentHour', 'CurrentYear', 'DTD', 'YTD'];
                toRemove.weekly = ['CurrentHour', 'CurrentDay', 'DTD', 'YTD'];
                toRemove.monthly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'DTD', 'MTD'];
                toRemove.yearly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'CurrentMonth', 'DTD', 'MTD'];
                var originalClone = original.clone(true);
                originalClone.find('option').each(function (i, val) {
                    if (toRemove[periodeType].indexOf(originalClone.find(val).val()) > -1) {
                        originalClone.find(val).remove();
                    }
                });
                $('#RangeFilter').replaceWith(originalClone);
            };

            rangeFilterSetup($('#PeriodeType').val().toLowerCase().trim());
            $('#PeriodeType').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                rangeFilterSetup($this.val().toLowerCase().trim());
                $('#range-holder').removeAttr('class');
            });

        };

        $('#graphic-type').change(function (e) {
            e.preventDefault();
            var $this = $(this);
            loadGraph($this.data('graph-url'), $this.val());
        });

        var initialGraphicType = $('#graphic-type');
        loadGraph(initialGraphicType.data('graph-url'), initialGraphicType.val());
        rangeControl();
        rangeDatePicker();
    };
    artifactDesigner.EditSetup = function() {
        var callback = Pear.Artifact.Designer._setupCallbacks;
        var loadGraph = function(url, type) {
            $.ajax({
                url: url,
                data: 'type=' + type,
                cache: true,
                method: 'GET',
                success: function(data) {
                    $('#graphic-settings').html(data);
                    var $hiddenFields = $('#hidden-fields');
                    $('#hidden-fields-holder').html($hiddenFields.html());
                    $hiddenFields.remove();
                    $('.graphic-properties').each(function(i, val) {
                        $(val).html('');
                    });
                    $('#graphic-settings').prev('.form-group').css('display', 'block');
                    if (callback.hasOwnProperty(type)) {
                        callback[type]();
                    }
                }
            });
        };
        $('#graphic-preview-btn').click(function(e) {
            e.preventDefault();
            var $this = $(this);
            Pear.Loading.Show($('#container'));
            $('#graphic-preview').modal('show');
            var callback = Pear.Artifact.Designer._previewCallbacks;
            $.ajax({
                url: $this.data('preview-url'),
                data: $this.closest('form').serialize(),
                method: 'POST',
                success: function (data) {
                    if (callback.hasOwnProperty(data.GraphicType)) {
                        Pear.Loading.Stop($('#container'));
                        callback[data.GraphicType](data, $('#container'));
                    }
                }
            });
        });
        
        $('#graphic-preview').on('show.bs.modal', function () {
                $('#container').css('visibility', 'hidden');
        });
        
        $('#graphic-preview').on('shown.bs.modal', function() {
            if ($('#container').highcharts() !== undefined)
                $('#container').highcharts().reflow();
            $('#container').css('visibility', 'visible');
        });
        
        $('#graphic-preview').on('hidden.bs.modal', function () {
            $('#container').html('');
        });

        var rangeDatePicker = function () {
            var format = $('#datetime-attr').attr('data-datepickerformat');
            $('.datepicker').datetimepicker({
                format: format,
            });
            $('.datepicker').change(function(e) {
                //console.log(this);
            });
            $('#PeriodeType').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                var clearValue = $('.datepicker').each(function(i, val) {
                    $(val).val('');
                    $(val).data("DateTimePicker").destroy();
                });
                switch ($this.val().toLowerCase().trim()) {
                    case 'hourly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY hh:00 A"
                        });
                        break;
                    case 'daily':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY"
                        });
                        break;
                    case 'weekly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY",
                            daysOfWeekDisabled: [0, 2, 3, 4, 5, 6]
                        });
                        break;
                    case 'monthly':
                        $('.datepicker').datetimepicker({
                            format: "MM/YYYY"
                        });
                        break;
                    case 'yearly':
                        $('.datepicker').datetimepicker({
                            format: "YYYY"
                        });
                        break;
                    default:
                }
            });
        };
        var rangeControl = function() {
            $('#RangeFilter').change(function(e) {
                e.preventDefault();
                var $this = $(this);
                $('#range-holder').prop('class', $this.val().toLowerCase().trim());
            });
            var original = $('#RangeFilter').clone(true);
            var rangeFilterSetup = function(periodeType) {
                var toRemove = {};
                toRemove.hourly = ['CurrentWeek', 'CurrentMonth', 'CurrentYear', 'YTD', 'MTD'];
                toRemove.daily = ['CurrentHour', 'CurrentYear', 'DTD', 'YTD'];
                toRemove.weekly = ['CurrentHour', 'CurrentDay', 'DTD', 'YTD'];
                toRemove.monthly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'DTD', 'MTD'];
                toRemove.yearly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'CurrentMonth', 'DTD', 'MTD'];
                var originalClone = original.clone(true);
                originalClone.find('option').each(function(i, val) {
                    if (toRemove[periodeType].indexOf(originalClone.find(val).val()) > -1) {
                        originalClone.find(val).remove();
                    }
                });
                $('#RangeFilter').replaceWith(originalClone);
            };

            rangeFilterSetup($('#PeriodeType').val().toLowerCase().trim());
            $('#PeriodeType').change(function(e) {
                e.preventDefault();
                var $this = $(this);
                rangeFilterSetup($this.val().toLowerCase().trim());
                $('#range-holder').removeAttr('class');
            });

        };

        $('#graphic-type').change(function(e) {
            e.preventDefault();
            var $this = $(this);
            loadGraph($this.data('graph-url'), $this.val());
        });
        rangeControl();
        rangeDatePicker();
        switch ($('#graphic-type').val()) {
            case 'speedometer':
                var $hiddenFields = $('#hidden-fields');
                var plotTemplate = $hiddenFields.find('.plot-band-template.original');
                var plotTemplateClone = plotTemplate.clone(true);
                plotTemplateClone.children('input:first-child').remove();
                $('#hidden-fields-holder').html(plotTemplateClone);
                plotTemplate.remove();
                $('#plot-bands-holder').append($hiddenFields.html());
                $('#plot-bands-holder').find('.plot-band-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                Pear.Artifact.Designer._setupCallbacks.speedometer();
                break;
            case 'trafficlight':
                var $hiddenFields = $('#hidden-fields');
                var plotTemplate = $hiddenFields.find('.plot-band-template.original');
                var plotTemplateClone = plotTemplate.clone(true);
                plotTemplateClone.children('input:first-child').remove();
                $('#hidden-fields-holder').html(plotTemplateClone);
                plotTemplate.remove();
                $('#plot-bands-holder').append($hiddenFields.html());
                $('#plot-bands-holder').find('.plot-band-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                Pear.Artifact.Designer._setupCallbacks.trafficlight();
                break;
            case 'line':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.series-template:not(.original)').each(function(i, val) {
                    $this = $(val);
                    $this.addClass('singlestack');
                    $this.addClass($('#bar-value-axis').val());
                    $this.addClass($('#graphic-type').val());
                });
                var seriesTemplate = $hiddenFields.find('.series-template.original');
                var seriesTemplateClone = seriesTemplate.clone(true);
                seriesTemplateClone.children('input:first-child').remove();
                $('#hidden-fields-holder').html(seriesTemplateClone);
                seriesTemplate.remove();
                $('#series-holder').append($hiddenFields.html());
                $('#series-holder').find('.series-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                Pear.Artifact.Designer._setupCallbacks.line();
                break;
            case 'bar':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.series-template:not(.original)').each(function(i, val) {
                    $this = $(val);
                    if ($this.find('.stack-template').length) {
                        $this.addClass('multistacks');
                    } else {
                        $this.addClass('singlestack');
                    }
                    $this.addClass($('#bar-value-axis').val());
                    $this.addClass($('#graphic-type').val());
                });
                var seriesTemplate = $hiddenFields.find('.series-template.original');
                var seriesTemplateClone = seriesTemplate.clone(true);
                seriesTemplateClone.children('input:first-child').remove();
                seriesTemplateClone.find('.stack-template').children('input:first-child').remove();
                $('#hidden-fields-holder').html(seriesTemplateClone);
                seriesTemplate.remove();
                $('#series-holder').append($hiddenFields.html());
                $('#series-holder').find('.series-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                var stackTemplate = $('#hidden-fields-holder').find('.stack-template.original');
                var stackTemplateClone = stackTemplate.clone(true);
                stackTemplate.closest('#hidden-fields-holder').append(stackTemplateClone);
                stackTemplate.remove();
                Pear.Artifact.Designer._setupCallbacks.bar();
                break;
            case 'baraccumulative':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.series-template:not(.original)').each(function(i, val) {
                    $this = $(val);
                    if ($this.find('.stack-template').length) {
                        $this.addClass('multistacks');
                    } else {
                        $this.addClass('singlestack');
                    }
                    $this.addClass($('#bar-value-axis').val());
                    $this.addClass($('#graphic-type').val());
                });
                var seriesTemplate = $hiddenFields.find('.series-template.original');
                var seriesTemplateClone = seriesTemplate.clone(true);
                seriesTemplateClone.children('input:first-child').remove();
                seriesTemplateClone.find('.stack-template').children('input:first-child').remove();
                $('#hidden-fields-holder').html(seriesTemplateClone);
                seriesTemplate.remove();
                $('#series-holder').append($hiddenFields.html());
                $('#series-holder').find('.series-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                var stackTemplate = $('#hidden-fields-holder').find('.stack-template.original');
                var stackTemplateClone = stackTemplate.clone(true);
                stackTemplate.closest('#hidden-fields-holder').append(stackTemplateClone);
                stackTemplate.remove();
                Pear.Artifact.Designer._setupCallbacks.baraccumulative();
                break;
            case 'barachievement':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.series-template:not(.original)').each(function(i, val) {
                    $this = $(val);
                    if ($this.find('.stack-template').length) {
                        $this.addClass('multistacks');
                    } else {
                        $this.addClass('singlestack');
                    }
                    $this.addClass($('#bar-value-axis').val());
                    $this.addClass($('#graphic-type').val());
                });
                var seriesTemplate = $hiddenFields.find('.series-template.original');
                var seriesTemplateClone = seriesTemplate.clone(true);
                seriesTemplateClone.children('input:first-child').remove();
                seriesTemplateClone.find('.stack-template').children('input:first-child').remove();
                $('#hidden-fields-holder').html(seriesTemplateClone);
                seriesTemplate.remove();
                $('#series-holder').append($hiddenFields.html());
                $('#series-holder').find('.series-template').each(function(i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                var stackTemplate = $('#hidden-fields-holder').find('.stack-template.original');
                var stackTemplateClone = stackTemplate.clone(true);
                stackTemplate.closest('#hidden-fields-holder').append(stackTemplateClone);
                stackTemplate.remove();
                Pear.Artifact.Designer._setupCallbacks.baraccumulative();
                break;
            case 'tank':
                Pear.Artifact.Designer._setupCallbacks.tank();
            case 'area':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.series-template:not(.original)').each(function (i, val) {
                    $this = $(val);
                    $this.addClass('singlestack');
                });
                var seriesTemplate = $hiddenFields.find('.series-template.original');
                var seriesTemplateClone = seriesTemplate.clone(true);
                seriesTemplateClone.children('input:first-child').remove();
                $('#hidden-fields-holder').html(seriesTemplateClone);
                seriesTemplate.remove();
                $('#series-holder').append($hiddenFields.html());
                $('#series-holder').find('.series-template').each(function (i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                Pear.Artifact.Designer._setupCallbacks.area();
                break;
            case 'tabular':
                var $hiddenFields = $('#hidden-fields');
                $hiddenFields.find('.row-template:not(.original)').each(function (i, val) {
                    $this = $(val);
                    $this.addClass('singlestack');
                });
                var rowsTemplate = $hiddenFields.find('.row-template.original');
                var rowsTemplateClone = rowsTemplate.clone(true);
                rowsTemplateClone.children('input:first-child').remove();
                $('#hidden-fields-holder').html(rowsTemplateClone);
                rowsTemplate.remove();
                $('#rows-holder').append($hiddenFields.html());
                $('#rows-holder').find('.row-template').each(function (i, val) {
                    var $this = $(val);
                    Pear.Artifact.Designer._kpiAutoComplete($this, false);
                    Pear.Artifact.Designer._colorPicker($this);
                });
                $hiddenFields.remove();
                $('#general-graphic-settings').css('display', 'none');
                $('.form-measurement').css('display', 'none');
                Pear.Artifact.Designer._setupCallbacks.tabular();
            
                break;
        }
        
        //$('#PeriodeType').change();
        $('#RangeFilter').change();
    };
    artifactDesigner._setupCallbacks = {};

    artifactDesigner.Preview = function () {
        $('#graphic-preview-btn').click(function (e) {
            e.preventDefault();
            Pear.Loading.Show($('#container'));
            $('#graphic-preview').modal('show');
            var $this = $(this);
            var callback = Pear.Artifact.Designer._previewCallbacks;
            $.ajax({
                url: $this.data('preview-url'),
                data: $this.closest('form').serialize(),
                method: 'POST',
                success: function (data) {
                    if (callback.hasOwnProperty(data.GraphicType)) {
                        Pear.Loading.Stop($('#container'));
                        callback[data.GraphicType](data, $('#container'));
                    }
                }
            });
        });
        
        $('#graphic-preview').on('show.bs.modal', function () {
            $('#container').css('visibility', 'hidden');
        });
        
        $('#graphic-preview').on('shown.bs.modal', function () {
            $('#container').css('visibility', 'visible');
            if ($('#container').highcharts() !== undefined)
                $('#container').highcharts().reflow();
        });
        
        $('#graphic-preview').on('hidden.bs.modal', function () {
            $('#container').html('');
        });
    };
    artifactDesigner._previewCallbacks = {};

    //bar chart
    artifactDesigner._setupCallbacks.bar = function () {
        var removeSeriesOrStack = function () {
            $('.series-template > .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.series-template').remove();
            });
            $('.stack-template > .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.stack-template').remove();
            });
        }
        var addSeries = function () {
            var seriesCount = $('#series-holder').find('.series-template').length + 1;
            $('#add-series').click(function (e) {
                e.preventDefault();
                var seriesTemplate = $('.series-template.original').clone(true);

                Pear.Artifact.Designer._kpiAutoComplete(seriesTemplate);
                Pear.Artifact.Designer._colorPicker(seriesTemplate);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'BarChart.Series.Index',
                    value: seriesCount
                }).appendTo(seriesTemplate);
                seriesTemplate.removeClass('original');
                seriesTemplate.attr('data-series-pos', seriesCount);
                if (seriesCount !== 0) {
                    var fields = ['Label', 'KpiId', 'ValueAxis', 'Color', 'PreviousColor'];
                    for (var i in fields) {
                        var field = fields[i];
                        seriesTemplate.find('#BarChart_Series_0__' + field).attr('name', 'BarChart.Series[' + seriesCount + '].' + field);
                    }
                }
                seriesTemplate.addClass($('#seriesType').val().toLowerCase());
                seriesTemplate.addClass($('#bar-value-axis').val());
                seriesTemplate.addClass($('#graphic-type').val());
                $('#series-holder').append(seriesTemplate);
                seriesCount++;
            });
        };
        var addStack = function () {
            var stackCount = $('#series-holder').find('.stack-template').length + 1;
            $('.add-stack').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var stackTemplate = $('.stack-template.original').clone(true);
                Pear.Artifact.Designer._kpiAutoComplete(stackTemplate);
                Pear.Artifact.Designer._colorPicker(stackTemplate);
                stackTemplate.removeClass('original');
                var seriesPos = $this.closest('.series-template').data('series-pos');
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'BarChart.Series[' + seriesPos + '].Stacks.Index',
                    value: stackCount
                }).appendTo(stackTemplate);
                var fields = ['Label', 'KpiId', 'ValueAxis', 'Color'];
                for (var i in fields) {
                    var field = fields[i];
                    stackTemplate.find('#BarChart_Series_0__Stacks_0__' + field).attr('name', 'BarChart.Series[' + seriesPos + '].Stacks[' + stackCount + '].' + field);
                }
                $this.closest('.stacks-holder').append(stackTemplate);
                stackCount++;
            });
        };

        removeSeriesOrStack();
        addSeries();
        addStack();
    };
    artifactDesigner._previewCallbacks.bar = function (data, container) {
        if (data.BarChart.SeriesType == "single-stack") {
            Pear.Artifact.Designer._displayBasicBarChart(data, container);
        } else if (data.BarChart.SeriesType == "multi-stack") {
            Pear.Artifact.Designer._displayMultistacksBarChart(data, container);
        } else {
            Pear.Artifact.Designer._displayMultistacksGroupedBarChart(data, container);
        }
    };
    artifactDesigner._displayBasicBarChart = function (data, container) {
        container.highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: data.BarChart.Title
            },
            subtitle: {
                text: data.BarChart.Subtitle,
            },
            xAxis: {
                categories: data.BarChart.Periodes,
                crosshair: true
            },
            yAxis: {
                //min: 0,
                title: {
                    text: data.BarChart.ValueAxisTitle
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y.format(2) + ' ' + data.BarChart.ValueAxisTitle + '<br/>' +
                        'Total: ' + this.point.stackTotal.format(2) + ' ' + data.BarChart.ValueAxisTitle;
                }
            },
            //tooltip: {
            //    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            //    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            //        '<td style="padding:0"><b>{point.y:.1f} ' + data.BarChart.ValueAxisTitle + '</b></td></tr>',
            //    footerFormat: '</table>',
            //    shared: true,
            //    useHTML: true
            //},
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: data.BarChart.Series
        });
    };
    artifactDesigner._displayMultistacksBarChart = function (data, container) {
        container.highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: data.BarChart.Title
            },
            subtitle: {
                text: data.BarChart.Subtitle,
            },
            xAxis: {
                categories: data.BarChart.Periodes,
                crosshair: true
            },
            yAxis: {
                //min: 0,
                title: {
                    text: data.BarChart.ValueAxisTitle
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            //legend: {
            //    align: 'right',
            //    x: -30,
            //    verticalAlign: 'top',
            //    y: 25,
            //    floating: true,
            //    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            //    borderColor: '#CCC',
            //    borderWidth: 1,
            //    shadow: false
            //},
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y.format(2) + ' ' + data.BarChart.ValueAxisTitle  + '<br/>' +
                        'Total: ' + this.point.stackTotal.format(2) + ' ' + data.BarChart.ValueAxisTitle;
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                        style: {
                            textShadow: '0 0 3px black'
                        }
                    }
                }
            },
            series: data.BarChart.Series
        });
    };
    artifactDesigner._displayMultistacksGroupedBarChart = function(data, container) {
        container.highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: data.BarChart.Title
            },
            subtitle: {
                text: data.BarChart.Subtitle,
            },
            xAxis: {
                categories: data.BarChart.Periodes,
                crosshair: true
            },
            yAxis: {
                //min: 0,
                title: {
                    text: data.BarChart.ValueAxisTitle
                }
            },

            tooltip: {
                formatter: function() {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y.format(2) + ' ' +data.BarChart.ValueAxisTitle + '<br/>' +
                        'Total: ' + this.point.stackTotal.format(2) + ' ' + data.BarChart.ValueAxisTitle;
                }
            },

            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            series: data.BarChart.Series
        });
    };
    artifactDesigner._setupCallbacks.baraccumulative = function () {
        Pear.Artifact.Designer._setupCallbacks.bar();
    };
    artifactDesigner._previewCallbacks.baraccumulative = function (data, container) {
        Pear.Artifact.Designer._previewCallbacks.bar(data, container);
    };
    artifactDesigner._setupCallbacks.barachievement = function () {
        $('#bar-value-axis').val('KpiActual');
        $('.main-value-axis').css('display', 'none');
        Pear.Artifact.Designer._setupCallbacks.bar();
    };
    artifactDesigner._previewCallbacks.barachievement = function (data, container) {
        Pear.Artifact.Designer._previewCallbacks.bar(data, container);
    };

    //line chart
    artifactDesigner._setupCallbacks.line = function() {
        var removeSeriesOrStack = function() {
            $('.series-template .remove').click(function(e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.series-template').remove();
            });
        }
        var addSeries = function() {
            //console.log('add-series');
            var seriesCount = $('#series-holder').find('.series-template').length + 1;
            $('#add-series').click(function(e) {
                //console.log('series-click');
                e.preventDefault();
                var seriesTemplate = $('.series-template.original').clone(true);

                Pear.Artifact.Designer._kpiAutoComplete(seriesTemplate);
                Pear.Artifact.Designer._colorPicker(seriesTemplate);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LineChart.Series.Index',
                    value: seriesCount
                }).appendTo(seriesTemplate);
                seriesTemplate.removeClass('original');
                seriesTemplate.attr('data-series-pos', seriesCount);
                if (seriesCount !== 0) {
                    var fields = ['Label', 'KpiId', 'ValueAxis' , 'Color'];
                    for (var i in fields) {
                        var field = fields[i];
                        seriesTemplate.find('#LineChart_Series_0__' + field).attr('name', 'LineChart.Series[' + seriesCount + '].' + field);
                    }
                }
                seriesTemplate.addClass($('#bar-value-axis').val());
                seriesTemplate.addClass($('#graphic-type').val());
                $('#series-holder').append(seriesTemplate);
                seriesCount++;
            });
        };
        removeSeriesOrStack();
        addSeries();
    };
    
    artifactDesigner._previewCallbacks.line = function(data, container) {
        container.highcharts({
            title: {
                text: data.LineChart.Title,
                x: -20 //center
            },
            subtitle: {
                text: data.LineChart.Subtitle,
                x: -20
            },
            //subtitle: {
            //    text: 'Source: WorldClimate.com',
            //    x: -20
            //},
            xAxis: {
                categories: data.LineChart.Periodes
            },
            yAxis: {
                title: {
                    text: data.LineChart.ValueAxisTitle
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },

            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y.format(2) + ' ' + data.LineChart.ValueAxisTitle;
                }
                //valueSuffix: data.LineChart.ValueAxisTitle
            },
            //legend: {
            //    layout: 'vertical',
            //    align: 'right',
            //    verticalAlign: 'middle',
            //    borderWidth: 0
            //},
            series: data.LineChart.Series
        });
    };

    //area chart
    artifactDesigner._setupCallbacks.area = function() {
        var removeSeriesOrStack = function() {
            $('.series-template .remove').click(function(e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.series-template').remove();
            });
        }
        var addSeries = function() {
            //console.log('add-series');
            var seriesCount = $('#series-holder').find('.series-template').length + 1;
            $('#add-series').click(function(e) {
                //console.log('series-click');
                e.preventDefault();
                var seriesTemplate = $('.series-template.original').clone(true);

                Pear.Artifact.Designer._kpiAutoComplete(seriesTemplate);
                Pear.Artifact.Designer._colorPicker(seriesTemplate);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'AreaChart.Series.Index',
                    value: seriesCount
                }).appendTo(seriesTemplate);
                seriesTemplate.removeClass('original');
                seriesTemplate.attr('data-series-pos', seriesCount);
                if (seriesCount !== 0) {
                    var fields = ['Label', 'KpiId', 'Color', 'ValueAxis'];
                    for (var i in fields) {
                        var field = fields[i];
                        seriesTemplate.find('#AreaChart_Series_0__' + field).attr('name', 'AreaChart.Series[' + seriesCount + '].' + field);
                    }
                }
                seriesTemplate.addClass($('#bar-value-axis').val());
                seriesTemplate.addClass($('#graphic-type').val());
                $('#series-holder').append(seriesTemplate);
                seriesCount++;
            });
        };
        removeSeriesOrStack();
        addSeries();
    };
    
    artifactDesigner._previewCallbacks.area = function(data, container) {
        container.highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: data.AreaChart.Title
            },
            subtitle: {
                text: data.AreaChart.Subtitle,
                x: -20
            },
            //subtitle: {
            //    text: 'Source: <a href="http://thebulletin.metapress.com/content/c4120650912x74k7/fulltext.pdf">' +
            //        'thebulletin.metapress.com</a>'
            //},
            xAxis: {
                allowDecimals: false,
                labels: {
                    formatter: function() {
                        return this.value; // clean, unformatted number for year
                    }
                },
                categories: data.AreaChart.Periodes
            },
            yAxis: {
                title: {
                    text: data.AreaChart.ValueAxisTitle
                },
                labels: {
                    formatter: function() {
                        return this.value;
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': ' + this.y.format(2) + ' ' + data.LineChart.ValueAxisTitle;
                }
                //valueSuffix: data.LineChart.ValueAxisTitle
            },
            plotOptions: {
                
                //area: {
                //    pointStart: data.AreaChart.Periodes[0],
                //    marker: {
                //        enabled: false,
                //        symbol: 'circle',
                //        radius: 2,
                //        states: {
                //            hover: {
                //                enabled: true
                //            }
                //        }
                //    }
                //}
            },
            series: data.AreaChart.Series
        });
    };

    //multiaxis
    artifactDesigner._setupCallbacks.multiaxis = function () {
        var removeChart = function () {
            $('.chart-template .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.chart-template').remove();
            });
        };
        var addChart = function () {
            var chartCount = 0;
            $('#add-chart').click(function () {
                var chartTemplate = $('.chart-template.original').clone(true);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'MultiaxisChart.Charts.Index',
                    value: chartCount
                }).appendTo(chartTemplate);
                chartTemplate.removeClass('original');
                chartTemplate.attr('data-chart-pos', chartCount);
                if (chartCount !== 0) {
                    var fields = ['ValueAxis', 'GraphicType'];
                    for (var i in fields) {
                        var field = fields[i];
                        chartTemplate.find('#MultiaxisChart_Charts_0__' + field).attr('name', 'MultiaxisChart.Charts[' + chartCount + '].' + field);
                    }
                }
                $('#charts-holder').append(chartTemplate);
                chartCount++;
            });
        };
        var graphicSettings = function () {
            var loadGraph = function (url, type) {
                $.ajax({
                    url: url,
                    data: 'type=' + type,
                    cache: true,
                    method: 'GET',
                    success: function (data) {
                        $('#graphic-settings').html(data);
                        var $hiddenFields = $('#hidden-fields');
                        $('#hidden-fields-holder').html($hiddenFields.html());
                        $hiddenFields.remove();
                        $('.graphic-properties').each(function (i, val) {
                            $(val).html('');
                        });
                        $('#graphic-settings').prev('.form-group').css('display', 'block');
                        if (callback.hasOwnProperty(type)) {
                            callback[type]();
                        }
                    }
                });
            };
        };
        removeChart();
        addChart();
    };

    //speedometer
    artifactDesigner._setupCallbacks.speedometer = function () {
        var removePlot = function () {
            $('.plot-band-template .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.plot-band-template').remove();
            });
        };

        var addPlot = function () {
            var plotPos = $('#plot-bands-holder').find('.plot-band-template').length + 1;
            $('#add-plot').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var plotBandTemplate = $('.plot-band-template.original').clone(true);
                plotBandTemplate.removeClass('original');
                Pear.Artifact.Designer._kpiAutoComplete(plotBandTemplate);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'SpeedometerChart.PlotBands.Index',
                    value: plotPos
                }).appendTo(plotBandTemplate);
                if (plotPos !== 0) {
                    var fields = ['From', 'To', 'Color'];
                    for (var i in fields) {
                        var field = fields[i];
                        plotBandTemplate.find('#SpeedometerChart_PlotBands_0__' + field).attr('name', 'SpeedometerChart.PlotBands[' + plotPos + '].' + field).attr('id', 'plot-bands-' + i);
                    }
                }
                Pear.Artifact.Designer._colorPicker(plotBandTemplate);
                $('#plot-bands-holder').append(plotBandTemplate);
                plotPos++;
            });
        };



        var rangeDatePicker = function () {
            $('.datepicker').datetimepicker({
                format: "MM/DD/YYYY hh:00 A"
            });
            $('.datepicker').change(function (e) {
                //console.log(this);
            });
            $('#SpeedometerChart_PeriodeType').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                var clearValue = $('.datepicker').each(function (i, val) {
                    $(val).val('');
                    $(val).data("DateTimePicker").destroy();
                });
                switch ($this.val().toLowerCase().trim()) {
                    case 'hourly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY hh:00 A"
                        });
                        break;
                    case 'daily':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY"
                        });
                        break;
                    case 'weekly':
                        $('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY",
                            daysOfWeekDisabled: [0, 2, 3, 4, 5, 6]
                        });
                        break;
                    case 'monthly':
                        $('.datepicker').datetimepicker({
                            format: "MM/YYYY"
                        });
                        break;
                    case 'yearly':
                        $('.datepicker').datetimepicker({
                            format: "YYYY"
                        });
                        break;
                    default:

                }
            });
        };
        var rangeControl = function () {
            $('#SpeedometerChart_RangeFilter').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                $('#range-holder').prop('class', $this.val().toLowerCase().trim());
            });
            var original = $('#SpeedometerChart_RangeFilter').clone(true);
            var rangeFilterSetup = function (periodeType) {
                var toRemove = {};
                toRemove.hourly = ['CurrentWeek', 'CurrentMonth', 'CurrentYear', 'YTD', 'MTD'];
                toRemove.daily = ['CurrentHour', 'CurrentYear', 'DTD', 'YTD'];
                toRemove.weekly = ['CurrentHour', 'CurrentDay', 'DTD', 'YTD'];
                toRemove.monthly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'DTD', 'MTD'];
                toRemove.yearly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'CurrentMonth', 'DTD', 'MTD'];
                var originalClone = original.clone(true);
                originalClone.find('option').each(function (i, val) {
                    if (toRemove[periodeType].indexOf(originalClone.find(val).val()) > -1) {
                        originalClone.find(val).remove();
                    }
                });
                $('#SpeedometerChart_RangeFilter').replaceWith(originalClone);
            };

            rangeFilterSetup($('#SpeedometerChart_PeriodeType').val().toLowerCase().trim());
            $('#SpeedometerChart_PeriodeType').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                rangeFilterSetup($this.val().toLowerCase().trim());
                $('#range-holder').removeAttr('class');
            });

        };

        Pear.Artifact.Designer._kpiAutoComplete($('#graphic-settings'));
        removePlot();
        addPlot();
        //rangeControl();
        //rangeDatePicker();
    };
    artifactDesigner._previewCallbacks.speedometer = function(data, container) {
        container.highcharts({
            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },

            title: {
                text: data.SpeedometerChart.Title
            },
            subtitle: {
                text: data.SpeedometerChart.Subtitle,
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    }, {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    }, {
                        
                        // default background
                    }, {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }]
            },

            // the value axis
            yAxis: {
                min: data.SpeedometerChart.PlotBands[0].from,
                max: data.SpeedometerChart.PlotBands[data.SpeedometerChart.PlotBands.length -1].to,

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: data.SpeedometerChart.ValueAxisTitle
                },
                plotBands: data.SpeedometerChart.PlotBands
            },

            series: [{
                name: data.SpeedometerChart.Series.name,
                data: data.SpeedometerChart.Series.data,
                tooltip: {
                    valueSuffix: ' ' + data.SpeedometerChart.ValueAxisTitle
                }
            }]
        });
    };

    //tabular
    artifactDesigner._setupCallbacks.tabular = function () {
        var removeRow = function () {
            $('.row-template .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.row-template').remove();
            });
        };
        var addRow = function () {
            var rowCount = $('#rows-holder').find('.row-template').length + 1;
            $('#add-row').click(function (e) {
                e.preventDefault();
                var rowTemplate = $('.row-template.original').clone(true);
                Pear.Artifact.Designer._kpiAutoComplete(rowTemplate, false);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'Tabular.Rows.Index',
                    value: rowCount
                }).appendTo(rowTemplate);
                rowTemplate.removeClass('original');
                rowTemplate.attr('data-row-pos', rowCount);
                //if (seriesCount !== 0) {
                var fields = ['PeriodeType', 'KpiId', 'RangeFilter', 'StartInDisplay', 'EndInDisplay'];
                for (var i in fields) {
                    var field = fields[i];
                    rowTemplate.find('#Tabular_Rows_0__' + field).attr('name', 'Tabular.Rows[' + rowCount + '].' + field);
                }
                //}
                //seriesTemplate.addClass($('#seriesType').val().toLowerCase());
                //seriesTemplate.addClass($('#bar-value-axis').val());
                $('#rows-holder').append(rowTemplate);
                rangeDatePicker(rowTemplate);
                rangeControl(rowTemplate);
                rowCount++;
            });
        };
        var rangeDatePicker = function (context) {
            context.find('.datepicker').datetimepicker({
                format: "MM/DD/YYYY hh:00 A"
            });
            context.find('.datepicker').change(function (e) {
                //console.log(this);
            });
            context.find('.periode-type').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                var clearValue = context.find('.datepicker').each(function (i, val) {
                    $(val).val('');
                    $(val).data("DateTimePicker").destroy();
                });
                switch ($this.val().toLowerCase().trim()) {
                    case 'hourly':
                        context.find('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY hh:00 A"
                        });
                        break;
                    case 'daily':
                        context.find('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY"
                        });
                        break;
                    case 'weekly':
                        context.find('.datepicker').datetimepicker({
                            format: "MM/DD/YYYY",
                            daysOfWeekDisabled: [0, 2, 3, 4, 5, 6]
                        });
                        break;
                    case 'monthly':
                        context.find('.datepicker').datetimepicker({
                            format: "MM/YYYY"
                        });
                        break;
                    case 'yearly':
                        context.find('.datepicker').datetimepicker({
                            format: "YYYY"
                        });
                        break;
                    default:
                }
            });
        };
        var rangeControl = function (context) {
            context.find('.range-filter').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                context.find('#range-holder').prop('class', $this.val().toLowerCase().trim());
            });
            var original = context.find('.range-filter').clone(true);
            var rangeFilterSetup = function (periodeType) {
                var toRemove = {};
                toRemove.hourly = ['CurrentWeek', 'CurrentMonth', 'CurrentYear', 'YTD', 'MTD'];
                toRemove.daily = ['CurrentHour', 'CurrentYear', 'DTD', 'YTD'];
                toRemove.weekly = ['CurrentHour', 'CurrentDay', 'DTD', 'YTD'];
                toRemove.monthly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'DTD', 'MTD'];
                toRemove.yearly = ['CurrentHour', 'CurrentDay', 'CurrentWeek', 'CurrentMonth', 'DTD', 'MTD'];
                var originalClone = original.clone(true);
                originalClone.find('option').each(function (i, val) {
                    if (toRemove[periodeType].indexOf(originalClone.find(val).val()) > -1) {
                        originalClone.find(val).remove();
                    }
                });
                context.find('.range-filter').replaceWith(originalClone);
            };

            //console.log(context.find('.periode-type').val());
            rangeFilterSetup(context.find('.periode-type').val().toLowerCase().trim());
            context.find('.periode-type').change(function (e) {
                e.preventDefault();
                var $this = $(this);
                rangeFilterSetup($this.val().toLowerCase().trim());
                context.find('#range-holder').removeAttr('class');
            });

        };
        addRow();
        removeRow();
        $('#general-graphic-settings').css('display', 'none');
        $('.form-measurement').css('display', 'none');
    };
    artifactDesigner._previewCallbacks.tabular = function (data, container) {
        console.log('writing table');
        var wrapper = $('<div>');
        wrapper.addClass('tabular-wrapper');
        wrapper.append($('<h3>').html(data.Tabular.Title));

        //container for scrolling table
        var tableScrollContainer = $('<div>');
        tableScrollContainer.addClass('table-scrolling-container');
        tableScrollContainer.css('width', '100%');
        tableScrollContainer.css('height', '270px');
        tableScrollContainer.css('overflow-y', 'scroll');

        var $table = $('<table>');
        $table.addClass('tabular');
        $table.addClass('table-bordered');
        var rowHeader = $('<tr>');
        rowHeader.append($('<th>').html('KPI Name'));
        //rowHeader.append($('<th>').html('Periode Type'));
        rowHeader.append($('<th>').html('Periode'));
        if (data.Tabular.Actual) {
            rowHeader.append($('<th>').html('Actual'));
        }
        if (data.Tabular.Target) {
            rowHeader.append($('<th>').html('Target'));
        }
        if (data.Tabular.Remark) {
            rowHeader.append($('<th>').html('Remark'));
        }
        //rowHeader.append($('<th>').html('Measurement'));
        $table.append(rowHeader);
        for (var i in data.Tabular.Rows) {
            var dataRow = data.Tabular.Rows[i];
            var row = $('<tr>');
            row.append($('<td class="tabular-kpi-name">').html(dataRow.KpiName + ' (' + dataRow.Measurement + ')'));
            //row.append($('<td>').html(dataRow.PeriodeType));
            row.append($('<td class="tabular-actual">').html(dataRow.Periode));
            if (data.Tabular.Actual) {
                row.append($('<td class="tabular-actual">').html(dataRow.Actual == null ? '-' : dataRow.Actual.format(2)));
            }
            if (data.Tabular.Target) {
                row.append($('<td class="tabular-target">').html(dataRow.Target == null ? '-' : dataRow.Target.format(2)));
            }
            if (data.Tabular.Remark) {
                row.append($('<td>').html(dataRow.Remark));
            }
            //row.append($('<td>').html(dataRow.Measurement));
            $table.append(row);
        }
        tableScrollContainer.append($table);
        wrapper.append(tableScrollContainer);

        //wrapper.append($table);
        container.html(wrapper);
    };

    //trafficlight
    artifactDesigner._setupCallbacks.trafficlight = function () {
        var removePlot = function () {
            $('.plot-band-template .remove').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                $this.closest('.plot-band-template').remove();
            });
        };

        var addPlot = function () {
            var plotPos = $('#plot-bands-holder').find('.plot-band-template').length + 1;
            $('#add-plot').click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var plotBandTemplate = $('.plot-band-template.original').clone(true);
                plotBandTemplate.removeClass('original');
                Pear.Artifact.Designer._kpiAutoComplete(plotBandTemplate);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'TrafficLightChart.PlotBands.Index',
                    value: plotPos
                }).appendTo(plotBandTemplate);
                if (plotPos !== 0) {
                    var fields = ['From', 'To', 'Color', 'Label'];
                    for (var i in fields) {
                        var field = fields[i];
                        plotBandTemplate.find('#TrafficLightChart_PlotBands_0__' + field).attr('name', 'TrafficLightChart.PlotBands[' + plotPos + '].' + field).attr('id', 'plot-bands-' + i);
                    }
                }
                Pear.Artifact.Designer._colorPicker(plotBandTemplate);
                $('#plot-bands-holder').append(plotBandTemplate);
                plotPos++;
            });
        };
        


        Pear.Artifact.Designer._kpiAutoComplete($('#graphic-settings'));
        removePlot();
        addPlot();
    };
    artifactDesigner._previewCallbacks.trafficlight = function (data, container) {
        container.trafficlight(data.TrafficLightChart);
    };

    //tank
    artifactDesigner._setupCallbacks.tank = function() {
        $('.main-value-axis').css('display', 'none');
        $('.form-measurement').css('display', 'none');
        Pear.Artifact.Designer._kpiAutoComplete($('#graphic-settings'), false);
    };
    artifactDesigner._previewCallbacks.tank = function(data, container) {
        var containerHeight = container.height() - 50;
        var tankToTopHeight = 75;
        var tankHeight = containerHeight - tankToTopHeight;
        var volumeColor = '#00aeef';
        var $tank = $('<div>', { 'class': 'tank-chart' });
        var generalWidth = 250;
        var volumeUnit = data.Tank.VolumeInventoryUnit;
        var periodeUnit = data.Tank.DaysToTankTopUnit;
        $tank.height(tankHeight);
        $tank.width(generalWidth);
        $tank.css('margin-top', tankToTopHeight + 'px');
        var $volume = $('<div>', { 'class': 'tank-volume' });
        var volumeHeight = data.Tank.VolumeInventory / data.Tank.MaxCapacity * tankHeight;
        $volume.height(volumeHeight);
        $volume.width(generalWidth - 2);
        $volume.css('background-color', volumeColor);
        var $tankToTop = $('<div>', { 'class': 'tank-to-top' });
        $tankToTop.append('<p>' + data.Tank.DaysToTankTop + ' ' + periodeUnit + '</p>');
        $tankToTop.append('<p>' + data.Tank.DaysToTankTopTitle + '</p>');
        $tankToTop.width(generalWidth);
        $tankToTop.height(tankToTopHeight);
        $tankToTop.css('top', -tankToTopHeight + 'px');
        var $volumeMeter = $('<div>', { 'class': 'tank-volume-meter' });
        $volumeMeter.height(tankHeight);

        var $zeroMeter = $('<p>', { 'class': 'tank-zero-meter' });
        $zeroMeter.html('- 0 ' + volumeUnit);

        var $minCapacity = $('<p>', { 'class': 'tank-min-capacity' });
        $minCapacity.html('- ' + data.Tank.MinCapacity.format(2) + ' ' + volumeUnit + ' (Min)');
        var minCapacityPos = data.Tank.MinCapacity / data.Tank.MaxCapacity * tankHeight;
        $minCapacity.css('bottom', minCapacityPos + 'px');

        var $maxCapacity = $('<p>', { 'class': 'tank-max-capacity' });
        $maxCapacity.html('- ' + data.Tank.MaxCapacity.format(2) + ' ' + volumeUnit + ' (Max)');

        var $currentVol = $('<p>', { 'class': 'tank-current-volume' });
        var currentVolPercent = Math.round(data.Tank.VolumeInventory / data.Tank.MaxCapacity * 100).toFixed(2);
        $currentVol.css('bottom', (volumeHeight - 6) + 'px');
        $currentVol.html('- ' + data.Tank.VolumeInventory.format(2) + ' ' + volumeUnit + ' (' + currentVolPercent + '%)');

        $tank.append($volume);
        $tank.append($tankToTop);
        $tank.append($volumeMeter);
        $tank.append($zeroMeter);
        $tank.append($minCapacity);
        $tank.append($maxCapacity);
        if (data.Tank.VolumeInventory != 0 && data.Tank.VolumeInventory != data.Tank.MinCapacity && data.Tank.MaxCapacity) {
            $tank.append($currentVol);
        }
        var $wrapper = $('<div>', { 'class': 'tank-wrapper' });
        $wrapper.html('<h3>' + data.Tank.Title + '</h3>');
        $wrapper.append('<h4>' + data.Tank.Subtitle + '</h4>');
        $wrapper.append($tank);
        container.html($wrapper);
        //console.log($('.tank-zero-meter'));
        //setTimeout(function () {
        //    $zeroMeter.css('width', $('.tank-zero-meter')[0].clientWidth + 'px');
        //    $minCapacity.css('width', $('.tank-min-capacity')[0].clientWidth + 'px');
        //    $maxCapacity.css('width', $('.tank-max-capacity')[0].clientWidth + 'px');
        //}, 100);

    };

    var templateEditor = Pear.Template.Editor;

    templateEditor._artifactSelectField = function (context) {
        context.find('.artifact-list').select2({
            ajax: {
                url: $('#hidden-fields-holder').data('artifact-url'),
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        term: params.term
                    };
                },
                processResults: function (data, page) {
                    return data;
                },
                cache: true
            },
            escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
            minimumInputLength: 1,
            templateResult: Pear.Artifact.Designer._formatKpi, // omitted for brevity, see the source of this page
            templateSelection: Pear.Artifact.Designer._formatKpiSelection // omitted for brevity, see the source of this page
        });
    };
    templateEditor.LayoutSetup = function () {
        $('.column-width').change(function () {
            var colWidth = $(this).val();
            var $column = $(this).closest('.layout-column');
            var $row = $(this).closest('.layout-row');
            var $currentCols = $row.children('.layout-column');
            $column.css('width', colWidth + '%');
            var colIndex = $row.find('.layout-column').index($column);
            var remainWidth = 100;
            var remainLength = $currentCols.length - colIndex - 1;
            $currentCols.each(function (i, val) {
                if (i <= colIndex) {
                    remainWidth -= parseFloat($(val)[0].style.width.replace('%', ''));
                } else {
                    $(val).css('width', (remainWidth / remainLength) + '%');
                }
            });
        });
        var addColumn = function () {
            var columnCount = 2;
            $('.add-column').click(function () {
                var $this = $(this);
                var $row = $(this).parent().find('.layout-row');
                //console.log($row);
                var currentCols = $row.children('.layout-column').length;
                var newWidth = 100 / (currentCols + 1);
                $row.children('.layout-column').each(function (i, val) {
                    $(val).css('width', newWidth + '%');
                });
                var newColumn = $('.layout-column.original').clone(true);
                newColumn.removeClass('original');
                newColumn.css('width', newWidth + '%');
                Pear.Template.Editor._artifactSelectField(newColumn);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns.Index',
                    value: columnCount
                }).prependTo(newColumn);
                newColumn.find('.column-width').attr('name', 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns[' + columnCount + '].Width');
                newColumn.find('.artifact-list').attr('name', 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns[' + columnCount + '].ArtifactId');
                $row.append(newColumn);
                columnCount++;
            });
        };

        var addRow = function () {
            
            var rowCount = 1;
            $('.add-row').click(function () {
                
                var row = $('.layout-row-wrapper.original').clone(true);
                row.removeClass('original');
                row.find('.layout-column.original').removeClass('original');
                row.find('.layout-row').attr('data-row-pos', rowCount);
                Pear.Template.Editor._artifactSelectField(row);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows.Index',
                    value: rowCount
                }).prependTo(row.find('.layout-row'));

                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows[' + rowCount + '].LayoutColumns.Index',
                    value: 1
                }).prependTo(row.find('.layout-column'));

                row.find('.column-width').attr('name', 'LayoutRows[' + rowCount + '].LayoutColumns[1].Width');
                row.find('.artifact-list').attr('name', 'LayoutRows[' + rowCount + '].LayoutColumns[1].ArtifactId');
                $('#rows-holder').append(row);
                rowCount++;
            });

        };
        $('.remove-row').click(function () {
            $(this).closest('.layout-row-wrapper').remove();
        });
        $('.remove-column').click(function () {
            var $this = $(this);
            var $column = $(this).closest('.layout-column');
            var $row = $(this).closest('.layout-row');
            var currentCols = $row.children('.layout-column').length;
            var newWidth = 100 / (currentCols - 1);
            $column.remove();
            $row.children('.layout-column').each(function (i, val) {
                $(val).css('width', newWidth + '%');
            });
        });
        
        $('#graphic-preview-btn').click(function (e) {
            e.preventDefault();
            var $this = $(this);
            $.ajax({
                url: $this.data('preview-url'),
                data: $this.closest('form').serialize(),
                method: 'POST',
                success: function (data) {
                    $('#container').html(data);
                    templateEditor.ViewSetup();
                    $('#graphic-preview').modal('show');
                }
            });
        });
        $('#graphic-preview').on('show.bs.modal', function () {
            $('#container').css('visibility', 'hidden');
        });
        $('#graphic-preview').on('shown.bs.modal', function () {
            $('#container').css('visibility', 'visible');
        });
        
        addRow();
        addColumn();
    };
    templateEditor.ViewSetup = function () {
        $('.artifact-holder').each(function (i, val) {
            
            Pear.Loading.Show($(val));
            var $holder = $(val);
            var url = $holder.data('artifact-url');
            var callback = Pear.Artifact.Designer._previewCallbacks;
            $.ajax({
                url: url,
                method: 'GET',
                success: function (data) {
                    if (callback.hasOwnProperty(data.GraphicType)) {
                        Pear.Loading.Stop($(val));
                        callback[data.GraphicType](data, $holder);
                    }
                }
            });
        });
    };
    templateEditor.EditSetup = function () {
        var addRow = function () {
            var rowCount = $('.template-edit').attr('data-row-count');
            $('.add-row').click(function () {
                var row = $('.layout-row-wrapper.original').clone(true);
                row.removeClass('original');
                row.find('.layout-column.original').removeClass('original');
                row.find('.layout-row').attr('data-row-pos', rowCount);
                Pear.Template.Editor._artifactSelectField(row);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows.Index',
                    value: rowCount
                }).prependTo(row.find('.layout-row'));

                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows[' + rowCount + '].LayoutColumns.Index',
                    value: 1
                }).prependTo(row.find('.layout-column'));

                row.find('.column-width').attr('name', 'LayoutRows[' + rowCount + '].LayoutColumns[1].Width').val(100);
                row.find('.artifact-list').attr('name', 'LayoutRows[' + rowCount + '].LayoutColumns[1].ArtifactId');
                $('#rows-holder').append(row);
                rowCount++;
            });
        };

        var addColumn = function () {
            var columMinWidth = 10;
            var columnCount = 2;
            $('.add-column').click(function() {
                var $this = $(this);
                var $row = $(this).parent().find('.layout-row');

                //alert error if total colum width execeed (> 100%)
                var currentWidth = 0;
                $row.find('.column-width').each(function () {
                    currentWidth += $(this).val() ? parseFloat($(this).val()) : 0;
                });
                if (currentWidth >= 100) {
                    alert('Total column width exceeded. Can not create more column.');
                    return;
                }

                //var currentCols = $row.children('.layout-column').length;
                //var newWidth = 100 / (currentCols + 1);
                //$row.children('.layout-column').each(function(i, val) {
                //    $(val).css('width', newWidth + '%');
                //});
                var newColumn = $('.layout-column.original').clone(true);
                var newWidth = 100 - currentWidth;
                newColumn.removeClass('original');
                newColumn.css('width', newWidth + '%');
                Pear.Template.Editor._artifactSelectField(newColumn);
                $('<input>').attr({
                    type: 'hidden',
                    id: 'foo',
                    name: 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns.Index',
                    value: columnCount
                }).prependTo(newColumn);
                newColumn.find('.column-width').attr('name', 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns[' + columnCount + '].Width').val(newWidth);
                newColumn.find('.artifact-list').attr('name', 'LayoutRows[' + $row.data('row-pos') + '].LayoutColumns[' + columnCount + '].ArtifactId');
                $row.append(newColumn);
                columnCount++;
            });
        };

        $('.remove-row').click(function () {
            $(this).closest('.layout-row-wrapper').remove();
        });
        $('.remove-column').click(function () {
            var $this = $(this);
            var $column = $(this).closest('.layout-column');
            var $row = $(this).closest('.layout-row');
            //var currentCols = $row.children('.layout-column').length;
            //var newWidth = 100 / (currentCols - 1);
            $column.remove();
            //$row.children('.layout-column').each(function (i, val) {
            //    $(val).css('width', newWidth + '%');
            //});
        });
        
        $('#graphic-preview-btn').click(function (e) {
            e.preventDefault();
            var $this = $(this);
            $.ajax({
                url: $this.data('preview-url'),
                data: $this.closest('form').serialize(),
                method: 'POST',
                success: function (data) {
                    //console.log(data);
                    $('#container').html(data);
                    templateEditor.ViewSetup();
                    $('#graphic-preview').modal('show');
                }
            });
        });
        $('#graphic-preview').on('show.bs.modal', function () {
            $('#container').css('visibility', 'hidden');
        });
        $('#graphic-preview').on('shown.bs.modal', function () {
            $('#container').css('visibility', 'visible');
        });
        var currentColWidth = 0;
        $('.column-width').click(function () {
            currentColWidth = $(this).val();
        });
        $('.column-width').change(function () {
            //alert($(this).val());
            var totalWidth = 0;
            $(this).parents('.layout-row-wrapper').find('.column-width').each(function () {
                totalWidth += $(this).val() ? parseFloat($(this).val()) : 0;
            });
            if (totalWidth > 100) {
                alert('Total column width max is 100');
                $(this).val(currentColWidth);

                return false;
            }
            $(this).parents('.layout-column').css('width', $(this).val() + '%');
        });
        
        addRow();
        addColumn();
        templateEditor._artifactSelectField($('.template-edit'));
    };

    $(document).ready(function () {
        if ($('.artifact-designer').length) {
            Pear.Artifact.Designer.GraphicSettingSetup();
            Pear.Artifact.Designer.Preview();
        }
        if ($('.artifact-edit').length) {
            Pear.Artifact.Designer.EditSetup();
        }
        if ($('.artifact-list').length) {
            Pear.Artifact.Designer.ListSetup();
        }
        if ($('.template-editor').length) {
            Pear.Template.Editor.LayoutSetup();
        }
        if ($('.template-view').length) {
            Pear.Template.Editor.ViewSetup();
        }
        if ($('.template-edit').length) {
            Pear.Template.Editor.EditSetup();
        }
    });
    window.Pear = Pear;
}(window, jQuery, undefined));