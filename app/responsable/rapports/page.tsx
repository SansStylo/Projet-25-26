import { getClass } from "@/app/actions";
import { RapportsContent } from "@/app/components/responsable/RapportsContent";

export default async function RapportsPage() {
  const classes = await getClass();
  return <RapportsContent classes={classes} />;
}
