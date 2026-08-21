from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('admissions', '0001_initial')]

    operations = [
        migrations.AddField(
            model_name='enquiry',
            name='admin_note',
            field=models.TextField(blank=True),
        ),
    ]
