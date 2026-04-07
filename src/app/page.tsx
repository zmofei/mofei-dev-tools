import Foot from '@/components/Common/Foot';
import StructuredData from '@/components/StructuredData';
import HomePageContent from '@/components/HomePageContent';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData type="website" language="en" />
      <HomePageContent lang="en" />

      <footer>
        <Foot />
      </footer>
    </div>
  );
}
