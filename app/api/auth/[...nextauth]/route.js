import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectToDB();

        // Check if user exists
        let existingUser = await User.findOne({ email: user.email.toLowerCase() });

        if (existingUser) {
          // Update provider info if signing in with OAuth for the first time
          if (account.provider === "google" && !existingUser.googleId) {
            existingUser.googleId = account.providerAccountId;
            existingUser.provider = "google";
            existingUser.isVerified = true;
            if (user.image && !existingUser.profilePicture) {
              existingUser.profilePicture = user.image;
            }
          } else if (account.provider === "github" && !existingUser.githubId) {
            existingUser.githubId = account.providerAccountId;
            existingUser.provider = "github";
            existingUser.isVerified = true;
            if (user.image && !existingUser.profilePicture) {
              existingUser.profilePicture = user.image;
            }
          }
          
          existingUser.lastLogin = new Date();
          await existingUser.save();
        } else {
          // Create new user
          const newUser = new User({
            username: user.name || user.email.split('@')[0],
            email: user.email.toLowerCase(),
            googleId: account.provider === "google" ? account.providerAccountId : undefined,
            githubId: account.provider === "github" ? account.providerAccountId : undefined,
            provider: account.provider,
            profilePicture: user.image || "",
            isVerified: true,
            personality: "Friendly",
            tone: "Balanced",
            preferences: {
              theme: "dark",
              language: "en",
              ttsEnabled: true,
              ttsVoice: "default",
              ttsSpeed: 1.0,
              notifications: true,
            },
          });

          await newUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      // Add user info to token on sign in
      if (account && user) {
        token.provider = account.provider;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom data to session
      if (token) {
        await connectToDB();
        const user = await User.findOne({ email: session.user.email.toLowerCase() });
        
        if (user) {
          session.user.id = user._id.toString();
          session.user.username = user.username;
          session.user.personality = user.personality;
          session.user.tone = user.tone;
          session.user.preferences = user.preferences;
          session.user.isAdmin = user.isAdmin;
          session.user.provider = token.provider;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
