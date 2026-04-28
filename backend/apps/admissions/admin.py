from django.contrib import admin
from .models import AdmissionStep, FeeRow, ImportantDate, Enquiry

admin.site.register(AdmissionStep)
admin.site.register(FeeRow)
admin.site.register(ImportantDate)
admin.site.register(Enquiry)
