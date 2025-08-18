import { useTwitterAuth } from "@/util/hooks/useTwitterAuth";
import { XIcon } from "./XIcon";

export const UserProfile = () => {
  const data = useTwitterAuth();

  const { isAuthenticated, user } = data;

  return isAuthenticated ? (
    <a
      href="/claimed"
      className="text-white flex flex-row items-center gap-2 absolute top-6 right-6 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 p-2 pr-4 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity"
    >
      <img
        src={user.profile_image_url}
        alt={`${user.name} profile picture`}
        className="size-7 rounded-full"
      />

      {user.username}
    </a>
  ) : (
    <a
      href={"/api/auth/twitter/login"}
      className="text-white flex flex-row items-center gap-2 absolute top-6 right-6 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 px-4 py-2 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity"
    >
      <XIcon width={20} height={20} className="fill-white" />
      Connect with X
    </a>
  );
};
