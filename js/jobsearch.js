'use strict';

class JobSearch {
	constructor() {
		this.cloudflare = "https://str.justyy.workers.dev/ziprecruiter";
		this.zipAPI = "https://api.ziprecruiter.com/jobs/v1";
		this.keyword = "Software Engineer";
		this.location = "Seattle, USA";
		this.radius = 200;
		this.age = 30;
		this.per = 15;
		this.page = 1;
		this.min_salary = 0;
	}

	async GetAPI() {
		let keyword = this.keyword;
		let location = this.location;
		let radius = this.radius;
		let age = this.age;
		let page = this.page;
		let per = this.per;
		let salary = this.min_salary;
		const cloudflare = this.cloudflare;

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
		
		function getURL(api, key) {
			return (api ? api : this.zipAPI) + 
								"?search=" + keyword + 
								"&location=" + location + 
								"&radius_miles=" + radius + 
								"&days_ago=" + age + 
								"&jobs_per_page=" + per + 
								"&page=" + page + 
								"&api_key=" + key + 
								"&refine_by_salary=" + salary;
		}

		const worker = await fetch(this.cloudflare);
		const worker_data = await worker.json();

		let key_to_api = {
			"e3ataxfnpynn4zhrtjinwkxi2s4sweg7": this.zipAPI,
			"p7ark7v2nzpzat6r38zhwuftm5p22x2m": this.zipAPI
		};
		let api_keys = Object.keys(key_to_api);

		if ((!worker_data) || (!worker_data.result)) {
			console.log("ERROR: " + this.cloudflare + " is down.");
		} else {
			let countries = Object.keys(worker_data);
			for (let i = 0; i < countries.length; i ++) {
				if (countries[i] === "result") continue;
				const current_key = worker_data[countries[i]]["key"];
				if (api_keys.includes(current_key)) continue;
				const current_api = worker_data[countries[i]]["api"];				
				console.log("country = " + countries[i]);
				console.log("current_key = " + current_key);
				console.log("current_api = " + current_api);
				api_keys.push(current_key);
				key_to_api[current_key] = current_api;
			}
		}

		let key = api_keys[0];
		let count = 0;

		for (let i = 0; i < api_keys.length; ++ i) {
			const current_key = api_keys[i];
			const current_api = key_to_api[current_key];
			try {
				const response = await fetch(getURL(current_api, current_key));
				const data = await response.json();
				if (data && (data.total_jobs) && (data.total_jobs > count)) { 
					count = data.total_jobs;
					key = current_key;
				}
			} catch (ex) {
				console.log(JSON.stringify(ex));
			}
		}
		return getURL(key_to_api[key], key);
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