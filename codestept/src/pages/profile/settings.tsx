import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/userAtom';
import Topbar from '@/components/Topbar/Topbar';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '@/lib/config';

const SettingsPage: React.FC = () => {
  const [user, setUser] = useAtom(userAtom);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePic || null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: newUsername })
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ ...user, username: data.user.username });
        window.location.href = `/profile/${data.user.username}`;
      } else {
        setUsernameError(data.error || "Failed to update username.");
      }
    } catch (error) {
      console.error('Update failed:', error);
      setUsernameError("An unexpected error occurred.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
    }
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile-pic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ profilePic: previewUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ ...user, profilePic: data.profilePic });
        setUploadError(null);
      } else {
        setUploadError(data.error || "Failed to upload profile picture.");
      }
    } catch (error) {
      setUploadError("An error occurred while uploading the profile picture.");
    }
  };

  const handleGoBack = () => {
    if (user?.username) {
      router.push(`/profile/${user.username}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 to-stone-900 text-white">
      <Topbar />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-dark-layer-1 rounded-2xl shadow-lg p-8 mt-10">
          {/* Back to Profile Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-orange">Setări Profil</h2>
            <button
              onClick={handleGoBack}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
            >
              ← Înapoi la profil
            </button>
          </div>

          <div className="space-y-6">
            {/* Username Section */}
            <div>
              <label className="block text-sm font-medium mb-1">Nume utilizator</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-2 rounded bg-dark-layer-2 text-white border border-dark-divider focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              {usernameError && <p className="text-red-500 mt-1 text-sm">{usernameError}</p>}
              <button
                onClick={handleUpdate}
                className="mt-3 bg-brand-orange hover:bg-brand-orange-s text-white font-semibold py-2 px-4 rounded transition"
              >
                Salvează modificări
              </button>
            </div>

            {/* Profile Picture Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Poză de profil</label>
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover mx-auto shadow-md"
                  />
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="text-sm text-gray-300 file:bg-brand-orange file:border-none file:px-3 file:py-2 file:rounded file:text-white hover:file:bg-brand-orange-s cursor-pointer"
              />
              {uploadError && <p className="text-red-500 mt-1 text-sm">{uploadError}</p>}
              <button
                onClick={handleUpload}
                className="mt-3 bg-brand-orange hover:bg-brand-orange-s text-white font-semibold py-2 px-4 rounded transition"
              >
                Încarcă poza
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
