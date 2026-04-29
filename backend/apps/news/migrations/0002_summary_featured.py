from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='newsarticle',
            name='summary',
            field=models.CharField(blank=True, help_text='Short teaser shown on listing cards.', max_length=400),
        ),
        migrations.AddField(
            model_name='newsarticle',
            name='is_featured',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='newsarticle',
            name='body',
            field=models.TextField(blank=True, help_text='Rich-text HTML allowed'),
        ),
    ]
