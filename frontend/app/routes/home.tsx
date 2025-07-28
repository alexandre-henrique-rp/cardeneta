import HomeComponent from "~/components/home-component";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GDC | Dashboard" },
    { name: "description", content: "Dashboard do GDC" },
  ];
}

export default function Home() {
  return (
    <>
     <HomeComponent />
    </>
  );
}
