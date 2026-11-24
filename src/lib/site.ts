// Contact details come from the old app's Config.java (2021). Ask ILC to confirm them before launch.
export const site = {
  name: "ILC Tamil Radio",
  url: "https://ilctamil.com",
  email: "ilctamilradio@gmail.com",
  playStore: "https://play.google.com/store/apps/details?id=com.techunk.ilctamilradio",
  youtube: "https://www.youtube.com/user/ILCTamilRadio",
  facebook: "https://www.facebook.com/search/top?q=ILC%20Tamil%20Radio",
  phones: {
    liveLine: "+44 20 3286 4959",
    viber: "+44 7402 078768",
    customerService: "+44 7448 360021",
  },
};

// The web player only works with an https stream: browsers block http audio on an https page.
const stream = process.env.NEXT_PUBLIC_STREAM_URL ?? "";
export const webStreamUrl = stream.startsWith("https://") ? stream : "";

export const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
