'use strict';

// local job search companies
let companies_s = localStorage.getItem("jobtools_companies");
let companies = {};
if (companies_s) {
    try {
        companies = JSON.parse(companies_s);
    } catch (e) {
        console.log(e);
        companies = {};
    }
}

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
    settings['per'] = $('select#per').val();
    settings['job_min_salary'] = $('input#min_salary').val();
    chrome.storage.sync.set({ 
        logosettings: settings
    }, function() {
        if (showMsg) {
            alert(get_text('alert_save'));
        }
    });
}

// search jobs
const searchJobs = (dom, companies_dom, page = 1, per = 100) => {
    let job_location = $('input#job_location').val().trim();
    let job_radius = parseInt($('input#job_radius').val());
    let job_keyword = $('input#job_keyword').val().trim();
    let job_age = parseInt($('input#job_age').val());
    let job_min_salary = parseInt($('input#min_salary').val());
    let jobs = new JobSearch(APP_KEY);
    jobs.SetLocation(job_location);
    jobs.SetKeyword(job_keyword);
    jobs.SetAge(job_age);
    jobs.SetRadius(job_radius);
    jobs.SetPage(page);
    jobs.SetMinSalary(job_min_salary);
    per = per || 50;
    jobs.SetPer(per);
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
                let total_jobs = data.total_jobs;
                let total_pages = Math.ceil(total_jobs / per);   
                let pagination = '<form class="form-inline">';
                pagination += get_text('total') + ': <b>' + total_jobs + "</b> " + get_text("page") + ": <B>" + page + "</B>/" + total_pages + "<BR/>";
                if (page > 1) {
                    pagination += "<button type='button' style='width:150px' class='form-control' id='prev'>" + get_text('prev') + "</button>";
                }                   
                if (page < total_pages) {
                    pagination += "<button type='button' style='width:150px' class='form-control' id='next'>" + get_text('next') + "</button>";
                }   
                pagination += "</form>";
                s += pagination;          
                s += '<table id="' + div_id + '" class="sortable">';
                s += '<thead><tr>';
                s += '<th> </th>';
                s += '<th>' + get_text('job_name', 'Job Title') + '</th>';
                s += '<th>' + get_text('company', 'Company') + '</th>';                
                s += '<th>' + get_text('job_date', 'Job Date') + '</th>';
                s += '<th>' + get_text('salary_min_annual', 'Min Annual Salary') + '</th>';
                s += '<th>' + get_text('salary_max_annual', 'Max Annual Salary') + '</th>';
                s += '<th>' + get_text('location', 'Location') + '</th>';
                s += '</tr></thead><tbody>';        
                let result = data.jobs;    
                for (let i = 0; i < result.length; i ++) {
                    let company_id = result[i]['hiring_company']['id'];
                    let company_name = result[i]['hiring_company']['name'];
                    let company_url = result[i]['hiring_company']['url'];
                    let company_description = result[i]['hiring_company']['description'];
                    s += '<tr title="' + result[i]['snippet'] + '">';
                    s += '<td>' + ((page - 1) * per + i + 1) + "</td>";
                    s += '<td><a target=_blank href="' + result[i]['url'] + '">' + result[i]['name'] + '</a></td>';
                    s += '<td><a target=_blank href="' + result[i]['url'] + '">' + company_name + '</a></td>';
                    s += '<td>' + result[i]['posted_time'] + '</td>';
                    s += '<td>' + result[i]['salary_min_annual'].toFixed(3) + '</td>';
                    s += '<td>' + result[i]['salary_max_annual'].toFixed(3) + '</td>';
                    s += '<td>' + result[i]['location'] + '</td>';
                    s += '</tr>';
                    if (company_name) {
                        companies[MD5(company_name)] = {"name": company_name, "url": company_url, "description": company_description};
                    }
                }
                s += '</tbody>';
                s += '</table><BR/>';      
                s += pagination;
                dom.html(s);
                if (page < total_pages) {
                    $('button#next').click(function() {
                        searchJobs(dom, companies_dom, page + 1, per);
                    });                
                }
                if (page > 1) {
                    $('button#prev').click(function() {
                        searchJobs(dom, companies_dom, page - 1, per);
                    }); 
                }
                sorttable.makeSortable(document.getElementById(div_id));
                // hiring companies
                s = '';
                div_id = "companies_result";
                s += '<table id="' + div_id + '" class="sortable">';
                s += '<thead><tr>';
                s += '<th>' + get_text('company', 'Company') + '</th>';                
                s += '</tr></thead><tbody>';        
                let keys = Object.keys(companies);
                for (let i = 0; i < keys.length; i ++) {
                    let key = keys[i];
                    let url = companies[key]['url'];
                    let desc = companies[key]['description'];
                    s += '<tr>';                    
                    if (url &&  url.startsWith("http")) {
                        s += '<td><a target=_blank href="' + url + '">' + companies[key]['name'] + '</a></td>';    
                    } else {
                        s += '<td>' + companies[key]['name'] + '</td>';    
                    }
                    /*
                    if (desc && desc != 'null') {
                        s += '<td>' + desc + '</td>';
                    } else {
                        s += "<td></td>";
                    }
                    */
                    s += '</tr>';
                }
                s += '</tbody>';
                s += '</table>';
                localStorage.setItem("jobtools_companies", JSON.stringify(companies));
                companies_dom.html(s);
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
            if (settings['per']) {
                $('select#per').val(settings['per']);
            } else {
                $('select#per').val("50");
            }
            if (settings['job_min_salary']) {
                $('input#min_salary').val(settings['job_min_salary']);
            } else {
                $('input#min_salary').val("0");
            }
        } else {
            $("select#lang").val('en-us');
            $('input#job_keyword').val('Software Engineer');
            $('input#job_location').val('London');
            $('input#job_age').val('14');
            $('input#job_radius').val('20');
            $('select#per').val("50");
            $('input#min_salary').val("0");
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
        searchJobs($('div#job_result'), $('div#companies'), 1, $('select#per').val());
    })
    $('select#per').change(function() {
        saveSettings(false);
        searchJobs($('div#job_result'), $('div#companies'), 1, this.value);
    })    
    // automatic search job when app loads
    setTimeout(function() {
        searchJobs($('div#job_result'), $('div#companies'), 1, $('select#per').val());
    }, 200);
    // clear button of hiring companies
    $('button#clear_btn').click(function() {
        companies = {};
        localStorage.setItem("jobtools_companies", JSON.stringify(companies));
        $('div#companies').html('');
    })
}, false);