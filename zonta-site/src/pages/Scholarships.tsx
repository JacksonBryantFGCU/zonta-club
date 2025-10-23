import { useQuery } from "@tanstack/react-query";
import { fetchScholarships, type Scholarship } from "../queries/scholarshipQueries";
import HeroImage from "../assets/hero_women_empowerment.jpg";

export default function Scholarships() {
  const {
    data: scholarships = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["scholarships"],
    queryFn: fetchScholarships,
    staleTime: 1000 * 60 * 10, // cache fresh for 10 minutes
  });

  return (
    <main className="flex flex-col items-center text-center overflow-hidden -mt-4">
      {/* ===== Hero Section ===== */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-center items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
            Scholarships & Opportunities
          </h1>
          <p className="text-lg sm:text-xl bg-white/70 text-zontaDark px-6 py-3 rounded-lg shadow-md font-medium">
            The Zonta Club of Naples provides scholarships to support women
            pursuing higher education and leadership opportunities. Learn more
            about our active scholarships and how to apply below.
          </p>
        </div>
      </section>

      {/* ===== Scholarships Section ===== */}
      <section className="py-20 px-6 bg-white text-zontaDark max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-zontaRed mb-10">
          Current Scholarships
        </h2>

        {isLoading ? (
          <p className="text-zontaDark/70">Loading scholarships...</p>
        ) : isError ? (
          <p className="text-red-600">Failed to load scholarships.</p>
        ) : scholarships.length === 0 ? (
          <p className="text-zontaDark/70">
            No active scholarships are currently available.
          </p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship: Scholarship) => (
              <div
                key={scholarship._id}
                className="bg-white border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {scholarship.imageUrl && (
                  <img
                    src={scholarship.imageUrl}
                    alt={scholarship.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-2xl font-semibold text-zontaRed mb-3">
                    {scholarship.title}
                  </h3>
                  <p className="text-zontaDark/80 text-sm mb-4">
                    {scholarship.description}
                  </p>

                  {scholarship.eligibility && (
                    <ul className="text-sm list-disc list-inside mb-4 text-zontaDark/70">
                      {scholarship.eligibility.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {scholarship.deadline && (
                    <p className="text-sm font-medium text-zontaDark/80 mb-4">
                      🗓️ Deadline:{" "}
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  )}

                  {scholarship.fileUrl ? (
                    <a
                      href={scholarship.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto bg-zontaRed text-white text-center px-6 py-2 rounded-lg hover:bg-zontaDark transition"
                    >
                      Download Application
                    </a>
                  ) : (
                    <p className="text-sm italic text-zontaDark/60 mt-auto">
                      Application form coming soon.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Application Process Section ===== */}
      <section className="py-20 px-6 bg-zontaGold/10 w-full">
        <div className="max-w-5xl mx-auto text-left">
          <h2 className="text-4xl font-bold text-zontaRed mb-8 text-center">
            Application Process
          </h2>
          <p className="text-lg text-zontaDark/80 mb-8 text-center">
            Applying for a Zonta Club of Naples scholarship is simple and open
            to all eligible women who share our values of education, service,
            and leadership.
          </p>

          <ol className="space-y-6 text-lg text-zontaDark/90 max-w-3xl mx-auto list-decimal list-inside">
            <li>
              <span className="font-semibold text-zontaRed">
                Review Available Scholarships:
              </span>{" "}
              Read through the scholarship descriptions above to determine which
              opportunity best fits your background and goals.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">
                Download and Complete the Application:
              </span>{" "}
              Each scholarship includes a downloadable PDF. Fill out the form
              carefully and gather any required supporting materials.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">
                Submit Your Application:
              </span>{" "}
              Email your completed form and documents to{" "}
              <a
                href="mailto:zonta.naples.scholarships@gmail.com"
                className="underline text-zontaRed hover:text-zontaDark"
              >
                zonta.naples.scholarships@gmail.com
              </a>{" "}
              before the stated deadline.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">
                Wait for Review:
              </span>{" "}
              Applications are reviewed by our scholarship committee. Selected
              recipients will be notified by email.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">
                Celebrate & Stay Connected:
              </span>{" "}
              Recipients are encouraged to attend a Zonta Club of Naples meeting
              or event to share their experiences and connect with our community.
            </li>
          </ol>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 px-6 bg-[#fbf1de] text-zontaRed w-full text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Supporting the Next Generation of Women Leaders
          </h2>
          <p className="text-lg mb-8">
            Through your support, Zonta continues to open doors for women across
            education, service, and leadership. Help us sustain these
            life-changing programs.
          </p>
          <button className="bg-zontaGold text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaRed transition-all duration-300">
            Donate to Our Scholarship Fund
          </button>
        </div>
      </section>
    </main>
  );
}