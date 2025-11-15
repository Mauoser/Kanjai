import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import DeleteAccountDialog from "../components/DeleteAccountDialog";
import useStore from "../store/useStore";
import {
  User,
  Mail,
  Trophy,
  Flame,
  Calendar,
  Settings,
  Trash2,
} from "lucide-react";

const Profile = () => {
  const user = useStore((state) => state.user);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Username:</span>
            <span>{user?.username}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Level:</span>
            <span>{user?.level}</span>
          </div>
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Current Streak:</span>
            <span>{user?.currentStreak} days</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Member Since:</span>
            <span>
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Settings</CardTitle>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lesson Batch Size</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={settings.lessonBatchSize}
              onChange={(e) =>
                updateSettings({ lessonBatchSize: parseInt(e.target.value) })
              }
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={15}>15 items</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Review Batch Size</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={settings.reviewBatchSize}
              onChange={(e) =>
                updateSettings({ reviewBatchSize: parseInt(e.target.value) })
              }
            >
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
              <option value={30}>30 items</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Preferred Mnemonic Style
            </label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={settings.preferredMnemonicStyle}
              onChange={(e) =>
                updateSettings({ preferredMnemonicStyle: e.target.value })
              }
            >
              <option value="visual">Visual</option>
              <option value="funny">Funny</option>
              <option value="story">Story</option>
              <option value="logical">Logical</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your
                data will be permanently removed.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
};

export default Profile;
