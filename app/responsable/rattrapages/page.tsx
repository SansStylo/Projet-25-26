import { getClass } from "@/app/actions";
import RattrapagesContent from "@/app/components/responsable/RattrapagesContent";

export default async function RattrapagesPage() {
  const classes = await getClass();
  return <RattrapagesContent classes={classes} />;
}
