import HomeView from '@/views/home';
import HomeHero from '@/views/home/HomeHero';

export default function HomePage() {
  return <HomeView hero={<HomeHero />} />;
}
