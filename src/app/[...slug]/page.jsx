import DemoOne from "@/components/ui/demo";

export function generateStaticParams() {
  return [
    { slug: ['dashboard'] },
    { slug: ['dashboard', 'files'] },
    { slug: ['dashboard', 'images'] },
    { slug: ['dashboard', 'videos'] },
    { slug: ['dashboard', 'music'] },
    { slug: ['dashboard', 'documents'] },
    { slug: ['analytics'] },
    { slug: ['settings'] },
    { slug: ['login-log'] },
    { slug: ['login'] },
    { slug: ['registration'] },
  ];
}

export default function CatchAllPage() {
  return <DemoOne />;
}