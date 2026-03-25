import { Metadata } from 'next';
import Link from 'next/link';
import {
  getClinicById,
  getSimilarClinics,
  getClinicsByCity,
  generateClinicPaths,
} from '@/utils/data';
import {
  generateClinicMetaTags,
  generateClinicSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from '@/utils/seo';
import ClinicCard from '@/components/ClinicCard';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medical-directory.example.com';

export async function generateStaticParams() {
  return generateClinicPaths();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const clinic = getClinicById(params.id);

  if (!clinic) {
    return {
      title: 'عيادة غير موجودة',
      description: 'العيادة المطلوبة غير موجودة في قاعدة البيانات',
    };
  }

  const metaTags = generateClinicMetaTags(clinic, siteUrl);

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    openGraph: {
      title: metaTags.ogTitle,
      description: metaTags.ogDescription,
      url: metaTags.ogUrl,
      type: 'website',
      images: [
        {
          url: metaTags.ogImage,
          width: 1200,
          height: 630,
          alt: clinic.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTags.ogTitle,
      description: metaTags.ogDescription,
      images: [metaTags.ogImage],
    },
    alternates: {
      canonical: metaTags.canonical,
    },
  };
}

export default function ClinicPage({ params }: { params: { id: string } }) {
  const clinic = getClinicById(params.id);

  if (!clinic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">عيادة غير موجودة</h1>
        <p className="text-gray-600 mb-6">
          للأسف، العيادة المطلوبة غير موجودة في قاعدة البيانات.
        </p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          العودة إلى الرئيسية
        </Link>
      </div>
    );
  }

  const similarClinics = getSimilarClinics(clinic, 3);
  const cityClinics = getClinicsByCity(clinic.city).slice(0, 5);

  const metaTags = generateClinicMetaTags(clinic, siteUrl);
  const clinicSchema = generateClinicSchema(clinic, siteUrl);
  const businessSchema = generateLocalBusinessSchema(clinic, siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'الرئيسية', url: siteUrl },
      { name: 'العيادات', url: `${siteUrl}/clinics/${clinic.cityEn}` },
      { name: clinic.name, url: `${siteUrl}/clinic/${clinic.id}` },
    ],
    siteUrl
  );

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([clinicSchema, businessSchema, breadcrumbSchema]),
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </Link>
            <span>/</span>
            <Link
              href={`/clinics/${clinic.cityEn}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {clinic.city}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-semibold">{clinic.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="mb-8">
              <img
                src={clinic.image}
                alt={clinic.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Basic Info */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {clinic.googleRating}
                  </span>
                  <span className="text-gray-600">
                    ({clinic.googleReviews} تقييم)
                  </span>
                </div>
              </div>

              {/* Specialty and Category */}
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {clinic.specialty}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  الفئة: {clinic.category}
                </span>
              </div>

              {/* Location */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold mb-3">📍 الموقع</h3>
                <p className="text-gray-700 mb-2">{clinic.address}</p>
                <p className="text-gray-600">
                  <strong>الحي:</strong> {clinic.district}
                </p>
                <p className="text-gray-600">
                  <strong>المدينة:</strong> {clinic.city}
                </p>
              </div>

              {/* Contact Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold mb-3">📞 التواصل</h3>
                <div className="space-y-2">
                  <p>
                    <strong>الهاتف:</strong>{' '}
                    <a
                      href={`tel:${clinic.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {clinic.phone}
                    </a>
                  </p>
                  {clinic.phone2 && (
                    <p>
                      <strong>الهاتف 2:</strong>{' '}
                      <a
                        href={`tel:${clinic.phone2}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {clinic.phone2}
                      </a>
                    </p>
                  )}
                  {clinic.website && (
                    <p>
                      <strong>الموقع:</strong>{' '}
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {clinic.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {Object.keys(clinic.socialMedia).length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold mb-3">📱 وسائل التواصل</h3>
                  <div className="flex gap-4">
                    {clinic.socialMedia.facebook && (
                      <a
                        href={clinic.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Facebook
                      </a>
                    )}
                    {clinic.socialMedia.instagram && (
                      <a
                        href={clinic.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 font-semibold"
                      >
                        Instagram
                      </a>
                    )}
                    {clinic.socialMedia.whatsapp && (
                      <a
                        href={`https://wa.me/${clinic.socialMedia.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold mb-3">📝 عن العيادة</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {clinic.description}
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-bold mb-4">🏥 الخدمات</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {clinic.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                  >
                    <p className="text-gray-700 font-semibold">{service}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-bold mb-4">ℹ️ معلومات إضافية</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {clinic.name} متخصصة في {clinic.specialty} بـ {clinic.city}. تقدم العيادة
                خدمات طبية متقدمة وتتمتع بتقييم عالي من العملاء بمعدل {clinic.googleRating} من 5 نجوم.
              </p>
              <p className="text-gray-700 leading-relaxed">
                تقع العيادة في {clinic.district}، وتوفر جميع الخدمات الطبية المتعلقة بـ
                {clinic.specialty}. يمكنك التواصل مع العيادة على الرقم {clinic.phone} للحصول على
                المزيد من المعلومات أو حجز موعد.
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Quick Contact */}
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow mb-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">تواصل الآن</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${clinic.phone}`}
                  className="block bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors"
                >
                  ☎️ اتصل الآن
                </a>
                {clinic.socialMedia.whatsapp && (
                  <a
                    href={`https://wa.me/${clinic.socialMedia.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-center hover:bg-green-600 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Similar Clinics */}
            {similarClinics.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">عيادات مشابهة</h3>
                <div className="space-y-3">
                  {similarClinics.map((c) => (
                    <Link
                      key={c.id}
                      href={`/clinic/${c.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="font-semibold text-gray-800 text-sm">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <span>⭐</span>
                        <span>{c.googleRating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other Clinics in City */}
            {cityClinics.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">عيادات في {clinic.city}</h3>
                <div className="space-y-3">
                  {cityClinics.map((c) => (
                    <Link
                      key={c.id}
                      href={`/clinic/${c.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="font-semibold text-gray-800 text-sm">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-600">{c.specialty}</p>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/clinics/${clinic.cityEn}`}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block"
                >
                  عرض جميع العيادات في {clinic.city} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
