import './style.css';
import type { Metadata } from "next";
import PlacementReadyController from './controller';

export const metadata: Metadata = {
  title: "Placement | Leadstor",
};

export default function Placements() {
  return <PlacementReadyController />;
}
