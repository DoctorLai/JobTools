'use strict';

class JobSearch {
	constructor() {
		this.api = "https://api.ziprecruiter.com/jobs/v1";
		this.keyword = "Software Engineer";
		this.location = "California, USA";
		this.radius = 100;
		this.age = 30;
		this.per = 15;
		this.page = 1;
		this.min_salary = 0;
	}

	TestKey(api_keys) {

	}

	async GetAPI() {
		let keyword = this.keyword;
		let location = this.location;
		let radius = this.radius;
		let age = this.age;
		let page = this.page;
		let per = this.per;
		let salary = this.min_salary;
		const api = this.api;
		keyword = keyword.trim();
		location = location.trim();
		radius = parseInt(radius);
		age = parseInt(age);
		keyword = encodeURIComponent(keyword);
		location = encodeURIComponent(location)		
		salary = parseInt(salary);
		if (!isNumeric(salary)) {
			salary = 0;
		}
		function getURL(key) {
			return api + "?search=" + keyword + "&location=" + location + "&radius_miles=" + radius + "&days_ago=" + age + "&jobs_per_page=" + per + "&page=" + page + "&api_key=" + key + "&refine_by_salary=" + salary;
		}
		const api_keys = ['7nab6vabqkzpfwmv6qs4h27z6inj6mrh', 'xmupr3vkrquvgb933zsi3niqft9khuh4'];		
		let key = api_keys[0];
		const response = await fetch(getURL(key));
		const data = await response.json();
		if ((!data) || (!data.total_jobs) || (data.total_jobs === 0)) { // first key is invalid then pick second
			console.log("Try other API Key which is " + api_keys[1]);
			key = api_keys[1];
		} else { // first key ok, try second key
			const response2 = await fetch(getURL(api_keys[1]));
			const data2 = await response2.json();
			if (data2 && (data2.total_jobs) && (data2.total_jobs > data.total_jobs)) { // second is better than first one
				console.log("Try other API Key which seems better " + api_keys[1]);
				key = api_keys[1];
			} 

		}
		return getURL(key);
	}

	Run() {
		const api = this.GetAPI();
		return fetch(api);
	}

	SetKeyword(keyword) {
		this.keyword = keyword.trim();
	}

	SetLocation(location) {
		this.location = location.trim();
	}

	SetAge(age) {		
		this.age = age;
	}

	SetRadius(radius) {
		this.radius = radius;
	}

	SetPage(page) {
		this.page = page;
	}

	SetPer(per) {
		this.per = per;
	}

	SetMinSalary(salary) {
		this.min_salary = salary;
	}
}