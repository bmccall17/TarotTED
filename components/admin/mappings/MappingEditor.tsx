'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CardSelector } from './CardSelector';
import { MappingsList } from './MappingsList';
import { MappingForm } from './MappingForm';
import { Toast } from '../ui/Toast';

type Card = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: string | null;
  sequenceIndex: number;
  imageUrl: string;
  mappingsCount: number;
  hasPrimary: boolean;
};

type Mapping = {
  id: string;
  cardId: string;
  talkId: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
  rationaleLong: string | null;
  createdAt: string;
  talkTitle: string;
  talkSlug: string;
  talkSpeakerName: string;
  talkThumbnailUrl: string | null;
  talkYear: number | null;
  talkIsDeleted: boolean;
};

type Props = {
  initialCards: Card[];
};

export function MappingEditor({ initialCards }: Props) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  // Fetch mappings when a card is selected
  useEffect(() => {
    if (!selectedCardId) {
      setMappings([]);
      return;
    }

    const fetchMappings = async () => {
      setLoadingMappings(true);
      try {
        const res = await fetch(`/api/admin/mappings?cardId=${selectedCardId}`);
        if (!res.ok) throw new Error('Failed to fetch mappings');
        const data = await res.json();
        setMappings(data.mappings);
      } catch (error) {
        console.error('Error fetching mappings:', error);
        setToast({ message: 'Failed to load mappings', type: 'error' });
      } finally {
        setLoadingMappings(false);
      }
    };

    fetchMappings();
  }, [selectedCardId]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
    setShowAddForm(false);
    setEditingMapping(null);
  };

  const handleAddMapping = () => {
    setEditingMapping(null);
    setShowAddForm(true);
  };

  const handleEditMapping = (mapping: Mapping) => {
    setEditingMapping(mapping);
    setShowAddForm(true);
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    try {
      const res = await fetch(`/api/admin/mappings/${mappingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete mapping');

      // Update local state
      setMappings((prev) => prev.filter((m) => m.id !== mappingId));

      // Update card's mapping count
      setCards((prev) =>
        prev.map((c) =>
          c.id === selectedCardId
            ? { ...c, mappingsCount: c.mappingsCount - 1 }
            : c
        )
      );

      setToast({ message: 'Mapping deleted', type: 'success' });
    } catch (error) {
      console.error('Error deleting mapping:', error);
      setToast({ message: 'Failed to delete mapping', type: 'error' });
    }
  };

  const handleSetPrimary = async (mappingId: string) => {
    try {
      const res = await fetch(`/api/admin/mappings/${mappingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setAsPrimary: true }),
      });

      if (!res.ok) throw new Error('Failed to set as primary');

      // Update local mappings state
      setMappings((prev) =>
        prev.map((m) => ({
          ...m,
          isPrimary: m.id === mappingId,
        }))
      );

      // Update card's hasPrimary status
      setCards((prev) =>
        prev.map((c) =>
          c.id === selectedCardId
            ? { ...c, hasPrimary: true }
            : c
        )
      );

      setToast({ message: 'Primary mapping updated', type: 'success' });
    } catch (error) {
      console.error('Error setting primary:', error);
      setToast({ message: 'Failed to update primary mapping', type: 'error' });
    }
  };

  const handleFormSubmit = async (data: {
    talkId: string;
    isPrimary: boolean;
    strength: number;
    rationaleShort: string;
    rationaleLong?: string;
  }) => {
    if (!selectedCardId) return;

    try {
      const res = await fetch('/api/admin/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCardId,
          ...data,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save mapping');
      }

      // Refresh mappings
      const mappingsRes = await fetch(`/api/admin/mappings?cardId=${selectedCardId}`);
      const mappingsData = await mappingsRes.json();
      setMappings(mappingsData.mappings);

      // Update cards list (refresh from server for accurate counts)
      const cardsRes = await fetch('/api/admin/mappings?cards=true');
      const cardsData = await cardsRes.json();
      setCards(cardsData.cards);

      setShowAddForm(false);
      setEditingMapping(null);
      setToast({
        message: editingMapping ? 'Mapping updated' : 'Mapping created',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving mapping:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to save mapping',
        type: 'error',
      });
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingMapping(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Card Selector - Left Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3">
        <CardSelector
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={handleCardSelect}
        />
      </div>

      {/* Mappings Panel - Right Side */}
      <div className="lg:col-span-8 xl:col-span-9">
        {selectedCard ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-100">
                      {selectedCard.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedCard.arcanaType === 'major'
                        ? 'Major Arcana'
                        : `${selectedCard.suit?.charAt(0).toUpperCase()}${selectedCard.suit?.slice(1)}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedCard.mappingsCount} mapping{selectedCard.mappingsCount !== 1 ? 's' : ''}
                      {!selectedCard.hasPrimary && selectedCard.mappingsCount > 0 && (
                        <span className="text-yellow-500 ml-2">(no primary)</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddMapping}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Mapping
                </button>
              </div>
            </div>

            {/* Mappings List or Form */}
            <div className="p-6">
              {showAddForm && selectedCardId ? (
                <MappingForm
                  cardId={selectedCardId}
                  existingMappings={mappings}
                  editingMapping={editingMapping}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              ) : loadingMappings ? (
                <div className="text-center py-12 text-gray-400">
                  Loading mappings...
                </div>
              ) : mappings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No mappings yet for this card</p>
                  <button
                    onClick={handleAddMapping}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Add the first mapping
                  </button>
                </div>
              ) : (
                <MappingsList
                  mappings={mappings}
                  onEdit={handleEditMapping}
                  onDelete={handleDeleteMapping}
                  onSetPrimary={handleSetPrimary}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-400">
              Select a card from the left to view and manage its mappings
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
