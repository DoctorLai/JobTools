'use strict';

// translation a text
const translate_text = (dom, lang, text) => {
    let s = lang[text];
    if (s) {
        dom.html(s);
    }
}

// translation language
const translation = (lang) => {
    translate_text($('h4#job_keyword'), lang, 'job_keyword');
    translate_text($('h4#job_age'), lang, 'job_age');
    translate_text($('h4#job_location'), lang, 'job_location');
    translate_text($('h4#job_radius'), lang, 'job_radius');
    translate_text($('a#text_setting'), lang, 'setting');
    translate_text($('a#text_log'), lang, 'log');
    translate_text($('h4#text_ui_language'), lang, 'ui_language');
    translate_text($('h4#text_logs'), lang, 'text_logs');
    translate_text($('h4#text_search'), lang, 'search');
    translate_text($('a#text_search'), lang, 'search');
    translate_text($('span#source_code'), lang, 'source_code');
    translate_text($('a#report_bugs'), lang, 'report_bugs');
    translate_text($('button#setting_save_btn'), lang, 'save');
    translate_text($('button#search_btn'), lang, 'search');
	translate_text($('span#proudly_brought_to_you_by'), lang, 'proudly_brought_to_you_by');
}

// get ui lang data
const get_lang = () => {
    let lang = $('select#lang').val();
    switch (lang) {
        case 'zh-cn': return (translation_simplified_chinese); 
        case 'en-us': return (translation_english); 
        case 'zh-tw': return (translation_traditional_chinese); 
    }	
}

// ui translate
const ui_translate = () => {
	let data = get_lang();
	translation(data);
}

// translate
const get_text = (x, default_text = '') => {
	let lang = get_lang();
	if (lang && lang[x]) {
		return lang[x];
	}
	return default_text;
}
