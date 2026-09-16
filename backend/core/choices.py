from django.db import models


class Province(models.TextChoices):
    AB = "AB", "Alberta"
    BC = "BC", "British Columbia"
    MB = "MB", "Manitoba"
    NB = "NB", "New Brunswick"
    NL = "NL", "Newfoundland and Labrador"
    NS = "NS", "Nova Scotia"
    NT = "NT", "Northwest Territories"
    NU = "NU", "Nunavut"
    ON = "ON", "Ontario"
    PE = "PE", "Prince Edward Island"
    QC = "QC", "Quebec"
    SK = "SK", "Saskatchewan"
    YT = "YT", "Yukon"
