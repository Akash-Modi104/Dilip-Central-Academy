from django.db import models


class AdmissionStep(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.order}. {self.title}'


class FeeRow(models.Model):
    label = models.CharField(max_length=200, help_text='e.g. "Grade 1 — Tuition Fee"')
    amount = models.CharField(max_length=80, help_text='Free-text, e.g. "₹15,000 / term"')
    note = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.label


class ImportantDate(models.Model):
    label = models.CharField(max_length=200)
    date_text = models.CharField(max_length=80, help_text='Free-text, e.g. "May 15, 2026"')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.label}: {self.date_text}'


class Enquiry(models.Model):
    UNREAD = 'unread'
    READ = 'read'
    RESPONDED = 'responded'
    STATUS = [(UNREAD, 'Unread'), (READ, 'Read'), (RESPONDED, 'Responded')]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    grade = models.CharField(max_length=80, blank=True)
    message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=12, choices=STATUS, default=UNREAD)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name_plural = 'Enquiries'

    def __str__(self):
        return f'{self.name} ({self.email})'
