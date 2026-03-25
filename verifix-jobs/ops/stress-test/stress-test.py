#!/usr/bin/env python3
"""
Verifix Jobs — Stress Test Script
Target: 1000 concurrent users, DAU 100K, MAU 1.2M

Usage:
    pip install locust
    locust -f ops/stress-test/stress-test.py --host=https://jobs.verifix.uz

Web UI: http://localhost:8089
Set: Users=1000, Spawn rate=50/s, Run time=10m
"""

from locust import HttpUser, task, between, tag, events
import random
import json
import time

# Test data
CITIES = ["Tashkent", "Samarkand", "Bukhara", "Andijan", "Namangan", "Fergana", "Nukus", "Karshi"]
CATEGORIES = ["COOK", "DRIVER", "SALES", "BUILDER", "CLEANER", "WAITER", "CASHIER", "WAREHOUSE", "SECURITY", "ELECTRICIAN"]
PHONES = [f"+99890{random.randint(1000000, 9999999)}" for _ in range(100)]


class CandidateUser(HttpUser):
    """Simulates a job-seeking candidate (70% of traffic)"""
    weight = 70
    wait_time = between(2, 8)

    @tag("public", "search")
    @task(30)
    def browse_vacancies(self):
        """Most common action: browse vacancy list"""
        city = random.choice(CITIES)
        self.client.get(
            f"/api/v1/public/vacancies?city={city}&page=0&size=20",
            name="/api/v1/public/vacancies [search]"
        )

    @tag("public", "search")
    @task(15)
    def search_with_query(self):
        """Text search"""
        query = random.choice(["oshpaz", "haydovchi", "sotuvchi", "quruvchi", "ish"])
        self.client.get(
            f"/api/v1/public/vacancies?q={query}&page=0&size=20",
            name="/api/v1/public/vacancies [text search]"
        )

    @tag("public", "detail")
    @task(20)
    def view_vacancy_detail(self):
        """View a specific vacancy"""
        # First get list, then view a detail
        resp = self.client.get(
            "/api/v1/public/vacancies?page=0&size=5",
            name="/api/v1/public/vacancies [for detail]"
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("content"):
                vacancy = random.choice(data["content"])
                vid = vacancy.get("slug") or vacancy.get("id")
                self.client.get(
                    f"/api/v1/public/vacancies/{vid}",
                    name="/api/v1/public/vacancies/:slug"
                )

    @tag("public", "hub")
    @task(10)
    def browse_categories(self):
        """Browse category list"""
        self.client.get("/api/v1/public/categories", name="/api/v1/public/categories")

    @tag("public", "hub")
    @task(10)
    def browse_cities(self):
        """Browse city list"""
        self.client.get("/api/v1/public/cities", name="/api/v1/public/cities")

    @tag("public", "category")
    @task(8)
    def browse_by_category(self):
        """Browse vacancies by category"""
        cat = random.choice(CATEGORIES)
        self.client.get(
            f"/api/v1/public/vacancies/category/{cat}?page=0&size=20",
            name="/api/v1/public/vacancies/category/:cat"
        )

    @tag("public", "geo")
    @task(5)
    def browse_by_city(self):
        """Browse vacancies by city"""
        city = random.choice(CITIES)
        self.client.get(
            f"/api/v1/public/vacancies/city/{city}?page=0&size=20",
            name="/api/v1/public/vacancies/city/:city"
        )

    @tag("public", "seo")
    @task(2)
    def sitemap(self):
        """Check sitemap (SEO bot simulation)"""
        self.client.get("/sitemap.xml", name="/sitemap.xml")


class EmployerUser(HttpUser):
    """Simulates an employer managing vacancies (25% of traffic)"""
    weight = 25
    wait_time = between(3, 12)
    token = None

    def on_start(self):
        """Register and login"""
        ts = int(time.time() * 1000)
        email = f"stress_{ts}_{random.randint(1000,9999)}@test.uz"
        resp = self.client.post("/api/v1/auth/employer/register", json={
            "name": f"Stress Test Co {ts}",
            "inn": f"ST{ts}",
            "email": email,
            "password": "StressTest123!"
        }, name="/api/v1/auth/employer/register")
        if resp.status_code == 200:
            self.token = resp.json().get("accessToken")

    def _auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @tag("employer", "dashboard")
    @task(20)
    def view_dashboard(self):
        """View employer dashboard"""
        self.client.get(
            "/api/v1/analytics/dashboard",
            headers=self._auth_headers(),
            name="/api/v1/analytics/dashboard"
        )

    @tag("employer", "vacancy")
    @task(15)
    def list_vacancies(self):
        """List employer vacancies"""
        self.client.get(
            "/api/v1/vacancies?page=0&size=20",
            headers=self._auth_headers(),
            name="/api/v1/vacancies [employer]"
        )

    @tag("employer", "vacancy")
    @task(5)
    def create_vacancy(self):
        """Create a new vacancy"""
        self.client.post("/api/v1/vacancies", json={
            "title": f"Stress Test Vacancy {random.randint(1, 10000)}",
            "description": "Bu stress test uchun yaratilgan vakansiya",
            "category": random.choice(CATEGORIES),
            "city": random.choice(CITIES),
            "employmentType": "FULL_TIME",
            "positionsCount": random.randint(1, 10),
            "salaryFrom": random.randint(2000000, 5000000),
            "salaryTo": random.randint(5000000, 10000000),
        }, headers=self._auth_headers(), name="/api/v1/vacancies [create]")

    @tag("employer", "applications")
    @task(15)
    def list_applications(self):
        """View applications"""
        self.client.get(
            "/api/v1/applications?page=0&size=20",
            headers=self._auth_headers(),
            name="/api/v1/applications [employer]"
        )

    @tag("employer", "board")
    @task(10)
    def vacancy_board(self):
        """Vacancy operations board"""
        self.client.get(
            "/api/v1/employer/vacancy-board",
            headers=self._auth_headers(),
            name="/api/v1/employer/vacancy-board"
        )

    @tag("employer", "inbox")
    @task(10)
    def response_inbox(self):
        """Response inbox"""
        self.client.get(
            "/api/v1/employer/response-inbox",
            headers=self._auth_headers(),
            name="/api/v1/employer/response-inbox"
        )

    @tag("employer", "intelligence")
    @task(5)
    def value_report(self):
        """Value report"""
        self.client.get(
            "/api/v1/employer/value-report",
            headers=self._auth_headers(),
            name="/api/v1/employer/value-report"
        )

    @tag("employer", "intelligence")
    @task(5)
    def hiring_funnel(self):
        """Hiring funnel analytics"""
        self.client.get(
            "/api/v1/intelligence/hiring/funnel",
            headers=self._auth_headers(),
            name="/api/v1/intelligence/hiring/funnel"
        )


class AdminUser(HttpUser):
    """Simulates admin operations (5% of traffic)"""
    weight = 5
    wait_time = between(5, 20)

    @tag("admin", "health")
    @task(30)
    def health_check(self):
        """Actuator health"""
        self.client.get("/actuator/health", name="/actuator/health")

    @tag("admin", "metrics")
    @task(20)
    def prometheus_metrics(self):
        """Prometheus scrape simulation"""
        self.client.get("/actuator/prometheus", name="/actuator/prometheus")

    @tag("admin", "api")
    @task(10)
    def salary_benchmarks(self):
        """Public salary data"""
        self.client.get("/api/v1/hrm/salary/benchmarks", name="/api/v1/hrm/salary/benchmarks")

    @tag("admin", "api")
    @task(10)
    def salary_trends(self):
        """Salary trends"""
        cat = random.choice(CATEGORIES)
        self.client.get(
            f"/api/v1/intelligence/salary/trends?category={cat}",
            name="/api/v1/intelligence/salary/trends"
        )
