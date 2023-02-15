import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { saveToDatabaseProps } from "@/lib/types";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("users");

    const data: saveToDatabaseProps = req.body;
    const variant = data.variant;
    const userData = data.user;
    const title = data.title;
    const remove = data.remove || false;
    const extra = data.extra;

    let safeTitle = title.name || title.title;
    let safeType = title.media_type || title.type;
    let safeId = title.id;
    let safePoster = title.poster_path
      ? "https://image.tmdb.org/t/p/w500" + title.poster_path
      : title.Poster || title.poster;

    const objectId = new ObjectId(userData.id);
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.json({
        ok: false,
        error: "User not found",
      });
    }

    const variantsArray = [
      "watching",
      "on-hold",
      "to-watch",
      "dropped",
      "completed",
    ];
    // !
    if (remove === true) {
      variantsArray.forEach(variantType => {
        if (!user[variantType]) return;

        const index = user[variantType].findIndex(
          (item: { id: any }) => item.id === title.id
        );
        if (index !== -1) {
          user[variantType].splice(index, 1);
        }
      });

      const result = await collection.replaceOne({ _id: objectId }, user);

      if (result.modifiedCount === 1) {
        return res.json({
          ok: true,
          status: 200,
          message: `"${safeTitle}(${safeId})" removed from "${variant}"`,
        });
      } else {
        throw {
          ok: false,
          message: `Failed to remove "${safeTitle}(${safeId})" from "${variant}"`,
        };
      }
    }
    // !
    let extraBackup;
    variantsArray.forEach(variantType => {
      if (!user[variantType]) return;

      const index = user[variantType].findIndex(
        (item: { id: any }) => item.id === title.id
      );
      if (index !== -1 && variantType !== variant) {
        extraBackup = user[variantType][index].extra;
        user[variantType].splice(index, 1);
      }
    });

    if (!user[variant]) {
      user[variant] = [];
    }

    const index = user[variant].findIndex(
      (item: { id: any }) => item.id === title.id
    );

    if (index === -1) {
      if (title.Type) {
        const response = await fetch(
          `https://api.themoviedb.org/3/find/${title.imdbID}?api_key=${process.env.TMDB_API}&language=en-US&external_source=imdb_id`
        );
        const titleDetails = await response.json();

        for (const key in titleDetails) {
          if (titleDetails[key].length > 0) {
            const ourTitle = titleDetails[key][0];
            safeTitle = ourTitle.title || ourTitle.name;
            safeType = ourTitle.media_type;
            safeId = ourTitle.id;
            break;
          }
        }
      }

      if (extraBackup) {
        user[variant].push({
          title: safeTitle,
          poster: safePoster,
          type: safeType,
          id: safeId,
          extra: extraBackup,
        });
      } else {
        user[variant].push({
          title: safeTitle,
          poster: safePoster,
          type: safeType,
          id: safeId,
        });
      }
    } else {
      if (extra) {
        if (!user[variant].extra) {
          user[variant].extra = {};
        }
        user[variant][index].extra = Object.assign({}, extra);
      }
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: user }
    );

    if (result.modifiedCount === 1) {
      if (extra) {
        return res.json({
          ok: true,
          status: 200,
          message: `added additional info to "${variant}"`,
        });
      }
      return res.json({
        ok: true,
        status: 200,
        message: `"${safeTitle}(${safeId})" added to "${variant}"`,
      });
    } else {
      throw {
        ok: false,
        message:
          index === -1
            ? `"${safeTitle}(${safeId})" already exists in "${variant}"`
            : `Failed to add "${safeTitle}(${safeId})" to "${variant}"`,
      };
    }
  } catch (err) {
    return res.json(err);
  }
}
