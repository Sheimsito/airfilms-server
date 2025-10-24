import config from "../config/config.js";


function simplifyVideos(data: any) {
  return data.videos.map((video: any) => ({
    id: video.id,
    thumbnail: video.image || video.video_pictures?.[0]?.picture
  }));
}

/**
 * @async
 * @function getSearchVideo
 * @returns {Promise<Object>} Search a thumbnail and id of a video related to a genre.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */
export async function getSearchVideo(query: string): Promise<any> {
    const response = await fetch(
        `https://api.pexels.com/videos/search?query=${query}&per_page=1`,
        {
            headers: {
                Authorization: config.pexelsApiKey,
            },
        }
    );

    const videos = simplifyVideos(await response.json());
    return videos;
}

/**
 * @async
 * @function getVideoById
 * @returns {Promise<Object>} Get the video data from Pexels API.
 * @throws {Error} Throws an error if the HTTP response is not OK.
 */
export async function getVideoById(id: string): Promise<any> {
    const response = await fetch(
        `https://api.pexels.com/videos/videos/${id}`,
        {
            headers: {
                Authorization: config.pexelsApiKey,
            },
        }
    );

    const data = await response.json();
    return data;
}