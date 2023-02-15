const checkTitle = async (title: any, str?: "full") => {
  try {
    // const url = process.env.NEXTAUTH_URL;
    const url = process.env.NEXT_PUBLIC_URL;

    if (str === "full") {
      const response = await fetch(`${url}/api/get-db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });
      const data = await response.json();
      return data;
    }

    const response = await fetch(`${url}/api/check-title`, {
      // method: "POST",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    });
    const data = await response.json();

    let fixedData = null;
    if (data === "watching") fixedData = "Watching";
    if (data === "on-hold") fixedData = "On-Hold";
    if (data === "to-watch") fixedData = "To Watch";
    if (data === "dropped") fixedData = "Dropped";
    if (data === "completed") fixedData = "Completed";
    return fixedData;
  } catch (err) {
    console.error(err);
    return "An error occurred";
  }
};
export default checkTitle;
