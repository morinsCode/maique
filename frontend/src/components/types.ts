export type Request = {
  guest: string;
  url: string;
  service: Service;
};

export type Service = "youtube" | "spotify" | "soundcloud";
