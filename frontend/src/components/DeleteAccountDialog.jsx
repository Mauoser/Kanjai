import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { authAPI } from "../services/api";
import useStore from "../store/useStore";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

const DeleteAccountDialog = ({ open, onOpenChange }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.deleteAccount(password);

      // Clear local storage first to prevent API interceptor from using old token
      localStorage.removeItem("token");
      localStorage.removeItem("kanjai-storage");

      // Clear store
      logout();

      // Redirect to home page
      navigate("/", { replace: true });

      // Show success message (optional)
      alert("Your account has been deleted successfully");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Failed to delete account");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data including:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All your learned kanji and progress</li>
                <li>Your personalized mnemonics</li>
                <li>Your learning statistics and streaks</li>
                <li>Your account settings and preferences</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Enter your password to confirm:
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete My Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
