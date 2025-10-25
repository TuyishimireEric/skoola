export interface AvatarData {
  avatar: string;
  avatarType: "emoji" | "custom";
  customAvatar: string | null;
  imageUrl: string | null;
}
