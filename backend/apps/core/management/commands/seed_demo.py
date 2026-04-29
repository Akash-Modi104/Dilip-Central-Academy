"""Seed sensible default content so the site doesn't look empty on first load.

Idempotent: only creates rows if none exist for that model. Safe to run repeatedly.
Run:  python manage.py seed_demo
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models import SiteSettings, NavLink, SEOMeta
from apps.homepage.models import Hero, Stat, Testimonial
from apps.academics.models import Program
from apps.faculty.models import AboutContent, PrincipalMessage, CoreValue
from apps.news.models import Notice


# Coordinates of the school from the Google Maps link the user provided.
LAT = 23.8025032
LNG = 85.465326
MAP_EMBED = f'https://maps.google.com/maps?q={LAT},{LNG}&z=16&output=embed'


class Command(BaseCommand):
    help = 'Seed default content for an empty install.'

    def handle(self, *args, **opts):
        self._site_settings()
        self._nav_links()
        self._hero()
        self._stats()
        self._programs()
        self._testimonials()
        self._about()
        self._principal()
        self._core_values()
        self._notices()
        self._seo()
        self.stdout.write(self.style.SUCCESS('seed_demo: done'))

    # ----- helpers -----
    def _site_settings(self):
        s = SiteSettings.load()
        # Only fill blanks — don't overwrite admin's edits.
        changed = False
        defaults = dict(
            school_name='Dilip Central Academy',
            tagline='Knowledge · Discipline · Character',
            founded_year=2010,
            primary_color='#0d47a1',
            accent_color='#ffb300',
            phone='+91-00000-00000',
            email='info@dilipcentralacademy.in',
            address='Ramgarh, Jharkhand, India',
            map_embed_url=MAP_EMBED,
            office_hours='Mon–Fri 8:00 AM – 4:00 PM',
        )
        for k, v in defaults.items():
            if not getattr(s, k):
                setattr(s, k, v)
                changed = True
        if changed:
            s.save()
            self.stdout.write('  ✓ site settings: filled blanks')

    def _nav_links(self):
        if NavLink.objects.exists():
            return
        for i, (label, url) in enumerate([
            ('Home', '/'), ('About', '/about'), ('Academics', '/academics'),
            ('Admissions', '/admissions'), ('News', '/news'),
            ('Gallery', '/gallery'), ('Contact', '/contact'),
        ]):
            NavLink.objects.create(label=label, url=url, order=i, is_active=True)
        self.stdout.write('  ✓ nav links: 7 created')

    def _hero(self):
        h = Hero.load()
        if not h.headline:
            h.headline = 'Shaping Tomorrow’s Leaders Today'
            h.subtext = ('A nurturing learning environment where students discover their '
                         'potential, build strong character, and prepare for a bright future.')
            h.cta_primary_label = 'Apply for Admission'
            h.cta_primary_url = '/admissions'
            h.cta_secondary_label = 'Learn More'
            h.cta_secondary_url = '/about'
            h.save()
            self.stdout.write('  ✓ hero: defaults set')

    def _stats(self):
        if Stat.objects.exists():
            return
        items = [
            ('🎓', 'Students Enrolled', '1,200+', 0),
            ('📈', 'Pass Rate', '98%', 1),
            ('🏆', 'Awards Won', '50+', 2),
            ('📚', 'Years of Excellence', '15+', 3),
        ]
        for icon, label, value, order in items:
            Stat.objects.create(icon=icon, label=label, value=value, order=order, is_active=True)
        self.stdout.write('  ✓ stats: 4 created')

    def _programs(self):
        if Program.objects.exists():
            return
        items = [
            ('Pre-Primary (Nursery–KG)', 'pre-primary',
             'A play-based foundation for the youngest learners.',
             'Curriculum focused on language, motor skills, and social development.', '🧸', 0, True),
            ('Primary (Grades 1–5)', 'primary',
             'Core literacy, numeracy and inquiry skills.',
             'CBSE-aligned with strong English, Hindi, Math, Science and arts.', '📝', 1, True),
            ('Middle School (Grades 6–8)', 'middle-school',
             'Building independence and analytical thinking.',
             'Subject specialists, project work, and introduction to lab sciences.', '🔬', 2, False),
            ('Secondary (Grades 9–10)', 'secondary',
             'Board preparation with strong foundations.',
             'CBSE Board curriculum with rigorous practice and mentorship.', '📐', 3, True),
        ]
        for title, slug, short, full, icon, order, featured in items:
            Program.objects.create(
                title=title, slug=slug,
                short_description=short, description=full,
                curriculum='', icon=icon,
                is_featured=featured, is_active=True, order=order,
            )
        self.stdout.write('  ✓ programs: 4 created')

    def _testimonials(self):
        if Testimonial.objects.exists():
            return
        items = [
            ('Anita Sharma', 'Parent of Grade 5 student',
             'The teachers genuinely care about every student. My daughter looks forward to school every single day.', 5, 0),
            ('Rohit Kumar', 'Alumnus, Class of 2018',
             'DCA gave me confidence, discipline, and a love for learning that has stayed with me through college.', 5, 1),
            ('Meena Verma', 'Parent of Grade 9 student',
             'Excellent academics combined with strong values. The new sports facilities are a great addition.', 4, 2),
        ]
        for name, role, quote, rating, order in items:
            Testimonial.objects.create(
                name=name, role=role, quote=quote, rating=rating,
                order=order, is_active=True,
            )
        self.stdout.write('  ✓ testimonials: 3 created')

    def _about(self):
        a = AboutContent.load()
        if not a.history:
            a.history = ('<p>Founded in 2010, Dilip Central Academy has grown into one of the '
                         'region’s most respected institutions, serving students from pre-primary '
                         'through secondary school.</p>')
            a.mission = ('<p>To deliver high-quality, value-based education that prepares students '
                         'academically, socially and emotionally for a fast-changing world.</p>')
            a.vision = ('<p>To be a model school where every child becomes a confident learner, '
                        'a kind human being, and a responsible citizen.</p>')
            a.save()
            self.stdout.write('  ✓ about: defaults set')

    def _principal(self):
        p = PrincipalMessage.load()
        if not p.message:
            p.name = 'Dr. R. K. Singh'
            p.designation = 'Principal'
            p.message = ('<p>At Dilip Central Academy, we believe that every child carries unique '
                         'gifts. Our role is to discover, nurture and celebrate those gifts so that '
                         'each student leaves us prepared for a life of learning, contribution and joy.</p>')
            p.save()
            self.stdout.write('  ✓ principal message: defaults set')

    def _core_values(self):
        if CoreValue.objects.exists():
            return
        items = [
            ('Excellence', 'Pursuing the highest standards in everything we do.', '⭐', 0),
            ('Integrity', 'Honesty, ethics and transparency in word and action.', '🤝', 1),
            ('Respect', 'For self, for others, and for our shared environment.', '💙', 2),
            ('Curiosity', 'A lifelong love of learning and discovery.', '🔍', 3),
        ]
        for title, desc, icon, order in items:
            CoreValue.objects.create(title=title, description=desc, icon=icon, order=order)
        self.stdout.write('  ✓ core values: 4 created')

    def _notices(self):
        if Notice.objects.exists():
            return
        Notice.objects.create(
            title='Admissions open for 2026–27 session',
            body='Applications are now being accepted for all classes. Visit the Admissions page or contact the school office for details.',
            is_active=True,
        )
        self.stdout.write('  ✓ notice: 1 created')

    def _seo(self):
        defaults = {
            'home': ('Home', 'A nurturing CBSE school in Ramgarh, Jharkhand.', 'school, CBSE, education, Ramgarh, Jharkhand'),
            'about': ('About Us', 'Our story, mission and values.', 'about, mission, vision'),
            'academics': ('Academics', 'Programs from pre-primary to secondary.', 'CBSE, programs, curriculum'),
            'admissions': ('Admissions', 'How to apply for the new academic session.', 'admissions, enrolment'),
            'contact': ('Contact', 'Reach our school office.', 'contact, address, phone'),
        }
        for key, (title, desc, kw) in defaults.items():
            SEOMeta.objects.update_or_create(
                page_key=key,
                defaults={'title': title, 'description': desc, 'keywords': kw},
            )
        self.stdout.write('  ✓ seo: 5 entries upserted')
