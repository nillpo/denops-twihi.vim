import { newTwitterAPI, TwitterAPI } from "./api.ts";
import { Media, SearchResult, Timeline, Update } from "./type.d.ts";
import { readConfig } from "./config.ts";
import { RequestOptions } from "https://raw.githubusercontent.com/snsinfu/deno-oauth-1.0a/main/extra/mod.ts";
import { base64 } from "./deps.ts";

export let twihiAPI: TwitterAPI;
export const endpoint = {
  api: Deno.env.get("TWIHI_TEST_ENDPOINT") ?? "https://api.twitter.com/1.1",
  upload: Deno.env.get("TWIHI_TEST_ENDPOINT") ??
    "https://upload.twitter.com/1.1",
};

export const loadConfig = async (): Promise<void> => {
  const config = await readConfig();
  const consumer = {
    key: config.consumerAPIKey,
    secret: config.consumerAPISecret,
  };
  const token = { key: config.accessToken, secret: config.accessTokenSecret };
  twihiAPI = newTwitterAPI(
    consumer,
    token,
  );
};

const apiCall = async <T>(
  method: "GET" | "POST",
  url: string,
  opts: RequestOptions,
): Promise<T> => {
  opts.token = twihiAPI.token;
  const resp = await twihiAPI.client.request(
    method,
    endpoint.api + url,
    opts,
  );
  if (!resp.ok) {
    throw new Error(`status: ${resp.statusText}, body: ${await resp.text()}`);
  }
  const body = await resp.json();
  return body as T;
};

export type HomeTimelineOptions = {
  count?: string;
};

export const homeTimeline = async (
  opts: HomeTimelineOptions,
): Promise<Timeline[]> => {
  const resp = await apiCall<Timeline[]>(
    "GET",
    "/statuses/home_timeline.json",
    { query: opts },
  );
  return resp;
};

export type StatusesUpdateOptions = {
  status: string;
  in_reply_to_status_id?: string;
  media_ids?: string;
};

export const statusesUpdate = async (
  opts: StatusesUpdateOptions,
): Promise<Update> => {
  const resp = await apiCall<Update>(
    "POST",
    "/statuses/update.json",
    {
      query: opts,
    },
  );
  return resp;
};

export type UserTimelineOptions = {
  screen_name?: string;
  count?: string;
};

export const userTimeline = async (
  opts: UserTimelineOptions,
): Promise<Timeline[]> => {
  const resp = await apiCall<Timeline[]>(
    "GET",
    "/statuses/user_timeline.json",
    {
      query: opts,
    },
  );
  return resp;
};

export const likeTweet = async (id: string): Promise<void> => {
  await apiCall("POST", "/favorites/create.json", {
    query: {
      id: id,
    },
  });
};

export const retweet = async (id: string): Promise<void> => {
  return await apiCall("POST", `/statuses/retweet/${id}.json`, {});
};

export type MentionsOptions = {
  count?: string;
  since_id?: string;
};

export const mentionsTimeline = async (
  opts: MentionsOptions,
): Promise<Timeline[]> => {
  const resp = await apiCall<Timeline[]>(
    "GET",
    "/statuses/mentions_timeline.json",
    {
      query: opts,
    },
  );
  return resp;
};

export const uploadMedia = async (
  data: Uint8Array,
): Promise<Media> => {
  const b64 = base64.encode(data);
  const resp = await twihiAPI.client.request(
    "POST",
    endpoint.upload + "/media/upload.json",
    {
      token: twihiAPI.token,
      form: {
        "media_data": b64,
      },
    },
  );

  if (!resp.ok) {
    throw new Error(`status: ${resp.statusText}, body: ${await resp.text()}`);
  }
  const media = await resp.json();
  return media;
};

export const searchTweets = async (
  q: string,
): Promise<SearchResult> => {
  const resp = await apiCall<SearchResult>("GET", "/search/tweets.json", {
    query: {
      q,
      count: "100",
    },
  });

  return resp;
};

export const listTimeline = async (
  list_id: string,
): Promise<Timeline[]> => {
  const resp = await apiCall<Timeline[]>("GET", "/lists/statuses.json", {
    query: {
      list_id,
      count: "100",
    },
  });
  return resp;
};
