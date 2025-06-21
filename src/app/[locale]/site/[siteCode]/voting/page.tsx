"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/utils";
import {
  Vote as VoteIcon,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

interface Vote {
  _id: string;
  title: string;
  description: string;
  options: string[];
  votes: Array<{
    userId: string;
    option: number;
    votedAt: string;
  }>;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function VotingPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create vote form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    options: ["", ""],
    startDate: "",
    endDate: "",
  });

  // Vote submission
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (user?.siteId) {
      fetchVotes();
    }
  }, [user, statusFilter]);

  const fetchVotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        status: statusFilter,
      });

      const response = await fetch(
        `/api/sites/${user?.siteId}/voting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVotes(data.votes || []);
      } else {
        toast.error("Oylamalar yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate options
    const validOptions = createForm.options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("En az 2 seçenek gereklidir");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}/voting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...createForm,
          options: validOptions,
        }),
      });

      if (response.ok) {
        toast.success("Oylama başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchVotes();
        setCreateForm({
          title: "",
          description: "",
          options: ["", ""],
          startDate: "",
          endDate: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Oylama oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating vote:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOption === null || !selectedVote) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/votes/${selectedVote._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          option: selectedOption,
        }),
      });

      if (response.ok) {
        toast.success("Oyunuz başarıyla kaydedildi!");
        setShowVoteModal(false);
        setSelectedVote(null);
        setSelectedOption(null);
        fetchVotes();
      } else {
        const error = await response.json();
        toast.error(error.message || "Oy kaydedilemedi");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const getVoteStatus = (vote: Vote) => {
    const now = new Date();
    const startDate = new Date(vote.startDate);
    const endDate = new Date(vote.endDate);

    if (!vote.isActive) return "inactive";
    if (now < startDate) return "upcoming";
    if (now > endDate) return "ended";
    return "active";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "ended":
        return "Sona Erdi";
      case "upcoming":
        return "Yaklaşan";
      case "inactive":
        return "Pasif";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success" as const;
      case "ended":
        return "default" as const;
      case "upcoming":
        return "warning" as const;
      case "inactive":
        return "danger" as const;
      default:
        return "default" as const;
    }
  };

  const hasUserVoted = (vote: Vote) => {
    return vote.votes.some((v) => v.userId === user?._id);
  };

  const getVoteResults = (vote: Vote) => {
    const results = vote.options.map((option, index) => ({
      option,
      count: vote.votes.filter((v) => v.option === index).length,
      percentage:
        vote.votes.length > 0
          ? Math.round(
              (vote.votes.filter((v) => v.option === index).length /
                vote.votes.length) *
                100
            )
          : 0,
    }));
    return results;
  };

  const addOption = () => {
    setCreateForm((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (createForm.options.length <= 2) return;
    setCreateForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const filteredVotes = votes.filter(
    (vote) =>
      vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: "all", label: "Tüm Oylamalar" },
    { value: "active", label: "Aktif" },
    { value: "upcoming", label: "Yaklaşan" },
    { value: "ended", label: "Sona Eren" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oylamalar</h1>
          <p className="text-gray-600">
            Site oylamalarını görüntüleyin ve katılın
          </p>
        </div>
        {user?.role === "site_admin" && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Oylama Oluştur
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Oylama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Votes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Yükleniyor...</p>
          </div>
        ) : filteredVotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <VoteIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Oylama bulunamadı</h4>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Arama kriterlerinizi değiştirin"
                  : "Henüz oylama bulunmuyor"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVotes.map((vote) => {
            const status = getVoteStatus(vote);
            const userVoted = hasUserVoted(vote);
            const results = getVoteResults(vote);

            return (
              <Card
                key={vote._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusVariant(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                      {userVoted && (
                        <Badge variant="info">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Oy Verildi
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(vote.createdAt)}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {vote.title}
                  </h3>

                  <p className="text-gray-700 mb-4">{vote.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDateTime(vote.startDate)} -{" "}
                        {formatDateTime(vote.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{vote.votes.length} oy</span>
                    </div>
                  </div>

                  {/* Vote Options Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Seçenekler:
                    </h4>
                    <div className="space-y-2">
                      {vote.options.map((option, index) => {
                        const result = results[index];
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700">
                              {option}
                            </span>
                            {(status === "ended" || userVoted) && (
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${result.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 min-w-[3rem]">
                                  {result.count} oy ({result.percentage}%)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Oluşturan: {vote.createdBy.firstName}{" "}
                      {vote.createdBy.lastName}
                    </div>

                    <div className="flex space-x-2">
                      {(status === "ended" || userVoted) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVote(vote);
                            setShowResultsModal(true);
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Sonuçlar
                        </Button>
                      )}

                      {status === "active" &&
                        !userVoted &&
                        user?.role === "resident" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVote(vote);
                              setSelectedOption(null);
                              setShowVoteModal(true);
                            }}
                          >
                            <VoteIcon className="h-4 w-4 mr-1" />
                            Oy Ver
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Vote Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Oylama Oluştur"
          size="lg"
        >
          <form onSubmit={handleCreateVote} className="space-y-4">
            <Input
              label="Başlık"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              required
            />

            <Textarea
              label="Açıklama"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seçenekler
              </label>
              <div className="space-y-2">
                {createForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Seçenek ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                    />
                    {createForm.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        Sil
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                + Seçenek Ekle
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Başlangıç Tarihi"
                type="datetime-local"
                value={createForm.startDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="Bitiş Tarihi"
                type="datetime-local"
                value={createForm.endDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Oylama Oluştur</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vote Submission Modal */}
      {showVoteModal && selectedVote && (
        <Modal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          title="Oy Ver"
        >
          <form onSubmit={handleSubmitVote} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedVote.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {selectedVote.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seçeneğinizi seçin:
              </label>
              <div className="space-y-2">
                {selectedVote.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="vote-option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVoteModal(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={selectedOption === null}>
                Oy Ver
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedVote && (
        <Modal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          title="Oylama Sonuçları"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedVote.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {selectedVote.description}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">Sonuçlar</h5>
                <span className="text-sm text-gray-500">
                  Toplam {selectedVote.votes.length} oy
                </span>
              </div>

              <div className="space-y-4">
                {getVoteResults(selectedVote).map((result, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900">{result.option}</span>
                      <span className="text-sm text-gray-500">
                        {result.count} oy ({result.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResultsModal(false)}
              >
                Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
