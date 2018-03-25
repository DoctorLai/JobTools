'use strict';

class JobSearch {
	// need app key
	constructor(key) {
		this.key = key;
		this.api = "https://api.ziprecruiter.com/jobs/v1";
		this.keyword = "Software Engineer";
		this.location = "London";
		this.radius = 14;
		this.age = 10;
		this.per = 10;
		this.page = 1;
	}

	GetAPI() {
		let keyword = this.keyword;
		let location = this.location;
		let radius = this.radius;
		let age = this.age;
		let page = this.page;
		let per = this.per;
		keyword = keyword.trim();
		location = location.trim();
		radius = parseInt(radius);
		age = parseInt(age);
		keyword = encodeURIComponent(keyword);
		location = encodeURIComponent(location)		
		return this.api + "?search=" + keyword + "&location=" + location + "&radius_miles=" + radius + "&days_ago=" + age + "&jobs_per_page=" + per + "&page=" + page + "&api_key=" + this.key;
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
}