import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Palette, Save, Image as ImageIcon, X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import '@/styles/color-picker.css';

interface BrandProfile {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  voice: string;
  primaryColor: string;
  secondaryColor: string;
  hashtags: string;
  icon?: string; // base64 or URL
}

const defaultProfile: BrandProfile = {
  name: '',
  tagline: '',
  description: '',
  mission: '',
  voice: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#EC4899',
  hashtags: '',
  icon: ''
};

export default function BrandingTab() {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [pickerField, setPickerField] = useState<keyof BrandProfile | null>(null);

  // Load existing profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('crows_eye_brand_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Backwards compatibility: map old colors string
        if (parsed.colors && !parsed.primaryColor) {
          const [first, second] = (parsed.colors as string).split(',').map((s: string) => s.trim());
          parsed.primaryColor = first || defaultProfile.primaryColor;
          parsed.secondaryColor = second || defaultProfile.secondaryColor;
        }
        setProfile({ ...defaultProfile, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load brand profile:', err);
    }
  }, []);

  const handleChange = (field: keyof BrandProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('crows_eye_brand_profile', JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save brand profile:', err);
    }
  };

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.color-input-wrapper')) {
        setPickerField(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleIconUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('icon', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-purple-400" />
            <div>
              <CardTitle className="text-white">Brand Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Define your brand details. These guidelines will be automatically
                considered when generating media or posts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Brand Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Crow's Eye"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tagline / Slogan</label>
                <Input
                  value={profile.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Your brand slogan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Brand Description</label>
                <Textarea
                  value={profile.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of your brand"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Mission & Voice */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Mission & Voice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Mission Statement</label>
                <Textarea
                  value={profile.mission}
                  onChange={(e) => handleChange('mission', e.target.value)}
                  placeholder="What drives your brand?"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Voice & Tone Guidelines</label>
                <Textarea
                  value={profile.voice}
                  onChange={(e) => handleChange('voice', e.target.value)}
                  placeholder="e.g. Friendly, professional, humorous"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Visual Identity */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Visual Identity</h3>

            {/* Color pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['primaryColor', 'secondaryColor'] as (keyof BrandProfile)[]).map((field) => (
                <div key={field} className="color-input-wrapper relative">
                  <label className="block text-sm text-gray-300 mb-1 capitalize">
                    {field === 'primaryColor' ? 'Primary Color' : 'Secondary Color'}
                  </label>
                  <Input
                    value={profile[field] as string}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onFocus={() => setPickerField(field)}
                    style={{ boxShadow: `0 0 0 2px ${profile[field] as string}` }}
                    className="pr-14"
                    placeholder="#4F46E5"
                  />
                  {/* Swatch */}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded border"
                    style={{ backgroundColor: profile[field] as string }}
                    onClick={() => setPickerField(field)}
                  />
                  {pickerField === field && (
                    <div className="absolute z-50 mt-2 right-0 shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <HexColorPicker
                        color={profile[field] as string}
                        onChange={(color) => handleChange(field, color)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Brand Icon */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Brand Icon</h4>
              {profile.icon ? (
                <div className="relative inline-block">
                  <img src={profile.icon} alt="Brand Icon" className="h-24 w-24 rounded-md border" />
                  <button
                    onClick={() => handleChange('icon', '')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    title="Remove icon"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-purple-300 hover:text-white">
                  <ImageIcon className="h-4 w-4" />
                  <span className="underline">Upload Icon</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleIconUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Hashtags */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preferred Hashtags</h3>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Hashtags (comma separated)</label>
              <Textarea
                value={profile.hashtags}
                onChange={(e) => handleChange('hashtags', e.target.value)}
                placeholder="#socialmedia, #branding, #crowseye"
                rows={2}
              />
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>

          {/* Saved Confirmation */}
          {saved && (
            <div className="flex justify-end">
              <Badge className="bg-green-600/20 text-green-300 border-green-600/30">Saved!</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 