import { Header, Hero, InfoSection, FAQ, Banner } from "~/components/LoadingPage";
import { BaseLayout } from "~/layouts/BaseLayout";

export default function ProjectsPage({ }) {
  return (

    <BaseLayout header={<Header />} customClassName="px-3  max-w-full">
      <Banner />
      <Hero />
      <InfoSection />
      <FAQ/>
    </BaseLayout>
  );
}

