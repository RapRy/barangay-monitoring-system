import { createClient } from "@/app/_lib/supabase/server";

export default async function TestRLSPage() {
  //   const [result, setResult] = useState<unknown>(null);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("households")
    .insert({
      household_no: `TEST-${Date.now()}`,
      address: "Test Address",
    })
    .select()
    .single();

  console.log(data);
  console.log(error);

  //   useEffect(() => {
  //     async function test() {
  //       const supabase = createClient();

  //       const {
  //         data: { user },
  //       } = await supabase.auth.getUser();

  //       const { data, error } = await supabase.from("households").select("*");

  //       setResult({
  //         user: user?.email,
  //         data,
  //         error,
  //       });
  //     }

  //     test();
  //   }, []);

  //   return <pre className="p-6">{JSON.stringify(result, null, 2)}</pre>;
  return <pre className="p-6">Insert</pre>;
}
