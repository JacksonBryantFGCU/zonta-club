import { useQuery } from "@tanstack/react-query";
import { fetchLeadership, type Leader } from "../queries/leadershipQueries";
import HeroImage from "../assets/hero_women_empowerment.jpg";

export default function About() {
  const { data: leaders = [], isLoading, isError } = useQuery({
    queryKey: ["leadership"],
    queryFn: fetchLeadership,
    staleTime: 1000 * 60 * 10, // keep fresh for 10 minutes
  });

  return (
    <main className="flex flex-col items-center text-center overflow-hidden -mt-4">
      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-center items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
            Who We Are
          </h1>
          <p className="text-lg sm:text-xl bg-white/70 text-zontaDark px-6 py-3 rounded-lg shadow-md font-medium">
            The Zonta Club of Naples empowers women through service and advocacy.
            Our members are local leaders committed to creating positive change
            in the community and beyond.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-6 bg-white text-zontaDark max-w-7xl mx-auto text-left">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-zontaRed mb-8 text-center">
            What We Do
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            Zonta Club of Naples brings together individuals who believe in
            gender equality and want to make a tangible impact in their
            communities. Our projects and initiatives focus on advocacy,
            education, and service.
          </p>
          <ul className="space-y-4 list-disc list-inside text-lg">
            <li>
              <span className="font-semibold text-zontaRed">Advocacy:</span>{" "}
              Working to influence policies that promote women’s rights and equality.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">Education:</span>{" "}
              Offering scholarships and recognition awards to empower women through learning.
            </li>
            <li>
              <span className="font-semibold text-zontaRed">Service:</span>{" "}
              Supporting initiatives that improve safety, dignity, and well-being of women locally.
            </li>
          </ul>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-6 bg-zontaGold/10 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-zontaRed mb-8">Leadership Team</h2>

          {isLoading ? (
            <p className="text-zontaDark/70">Loading leadership members...</p>
          ) : isError ? (
            <p className="text-red-600">Failed to load leadership data.</p>
          ) : leaders.length === 0 ? (
            <p className="text-zontaDark/70">
              No leadership members found in Sanity.
            </p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {leaders.map((leader: Leader) => (
                <div
                  key={leader._id}
                  className="bg-white border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center p-6"
                >
                  {leader.imageUrl ? (
                    <img
                      src={leader.imageUrl}
                      alt={leader.name}
                      className="w-32 h-32 object-cover rounded-full border-4 border-zontaGold mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-zontaGold mb-4 bg-zontaGold/20 text-zontaDark">
                      No Image
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-zontaRed mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-zontaDark/80 font-medium mb-2">
                    {leader.role}
                  </p>
                  {leader.bio && (
                    <p className="text-sm text-zontaDark/70 leading-snug">
                      {leader.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}