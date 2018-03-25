'use strict';

// log in the textarea
const logit = (msg) => {
    let d = new Date();
    let n = d.toLocaleTimeString();
    let dom = $('textarea#about');
    let s = dom.val();
    dom.val(s + "\n" + n + ": " + msg);
}

// save settings
const saveSettings = (showMsg = true) => {
    let settings = {};
    settings['lang'] = $('select#lang').val();
    settings['job_keyword'] = $('input#job_keyword').val();
    settings['job_location'] = $('input#job_location').val();
    settings['job_age'] = $('input#job_age').val();
    settings['job_radius'] = $('input#job_radius').val();
    chrome.storage.sync.set({ 
        logosettings: settings
    }, function() {
        if (showMsg) {
            alert(get_text('alert_save'));
        }
    });
}

// search jobs
const searchJobs = (dom) => {
    let job_location = $('input#job_location').val().trim();
    let job_radius = parseInt($('input#job_radius').val());
    let job_keyword = $('input#job_keyword').val().trim();
    let job_age = parseInt($('input#job_age').val());
    let jobs = new JobSearch(APP_KEY);
    jobs.SetLocation(job_location);
    jobs.SetKeyword(job_keyword);
    jobs.SetAge(job_age);
    jobs.SetRadius(job_radius);
    jobs.SetPage(1);
    jobs.SetPer(100);
    let api = jobs.GetAPI();
    logit(get_text("calling", "calling") + " " + api);
    dom.html('<img src="images/loading.gif" />');
    $.ajax({
        type: "GET",
        url: api,
        success: function(data) {
            if (data && data.success && data.jobs) {
                let s = '';
                let div_id = "job_results";
                s += '<table id="' + div_id + '" class="sortable">';
                s += '<thead><tr>';
                s += '<th>' + get_text('job_id', 'job_id') + '</th>';
                s += '<th>' + get_text('company', 'company') + '</th>';
                s += '<th>' + get_text('job_date', 'job_date') + '</th>';
                s += '<th>' + get_text('salary_min_annual', 'salary_min_annual') + '</th>';
                s += '<th>' + get_text('salary_max_annual', 'salary_max_annual') + '</th>';
                s += '</tr></thead><tbody>';        
                let result = data.jobs;    
                for (let i = 0; i < result.length; i ++) {
                    s += '<tr>';
                    s += '<td>' + result[i]['id'].substr(-20) + '</td>';
                    s += '<td><a target=_blank href="' + result[i]['url'] + '">' + result[i]['hiring_company']['name'] + '</a></td>';
                    s += '<td>' + result[i]['posted_time'] + '</td>';
                    s += '<td>' + result[i]['salary_min_annual'].toFixed(3) + '</td>';
                    s += '<td>' + result[i]['salary_max_annual'].toFixed(3) + '</td>';                                       
                    s += '</tr>';
                }
                s += '</tbody>';
                s += '</table><BR/>';      
                dom.html(s);
                sorttable.makeSortable(document.getElementById(div_id));
            } else {
                dom.html('');
            }
        },
        error: function(request, status, error) {
            logit(get_text('response', 'Response') + ': ' + request.responseText);
            logit(get_text('error', 'Error') + ': ' + error );
            logit(get_text('status', 'Status') + ': ' + status);
            dom.html('');
        },
        complete: function(data) {
            logit(get_text("api_finished", "API Finished") + ": " + api);
        }             
    });     
}

// on document ready
document.addEventListener('DOMContentLoaded', function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });      
    // load settings
    chrome.storage.sync.get('logosettings', function(data) {
        if (data && data.logosettings) {
            let settings = data.logosettings;
            let lang = settings['lang'];
            $("select#lang").val(lang);
            $('input#job_keyword').val(settings['job_keyword']);
            $('input#job_location').val(settings['job_location']);
            $('input#job_age').val(settings['job_age']);
            $('input#job_radius').val(settings['job_radius']);
        } else {
            $("select#lang").val('en-us');
            $('input#job_keyword').val('Software Engineer');
            $('input#job_location').val('London');
            $('input#job_age').val('14');
            $('input#job_radius').val('20');
        }
        // about
        let manifest = chrome.runtime.getManifest();    
        let app_name = manifest.name + " v" + manifest.version;
        // version number
        $('textarea#about').val(get_text('application') + ': ' + app_name + '\n' + get_text('chrome_version') + ': ' + getChromeVersion());
        // translate
        ui_translate();
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
        // translate
        ui_translate();        
    });
    // search a job
    $('button#search_btn').click(function() {
        saveSettings(false);
        searchJobs($('div#job_result'));
    })
    // automatic search job when app loads
    setTimeout(function() {
        searchJobs($('div#job_result'));
    }, 200);
}, false);