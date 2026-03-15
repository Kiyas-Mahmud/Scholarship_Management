<script setup lang="ts">
definePageMeta({
  layout: "default",
});

type ProfessorStatus =
  | "draft"
  | "sent"
  | "replied"
  | "followup"
  | "interview"
  | "accepted"
  | "rejected";

type ProfessorItem = {
  id: string;
  professorName: string;
  email: string;
  universityName: string;
  department: string | null;
  country: string | null;
  researchArea: string | null;
  deadlineAt: string | null;
  lastContactAt: string | null;
  nextFollowupAt: string | null;
  status: ProfessorStatus;
  notes: string | null;
  tags?: string[];
};

type ProfessorListResponse = {
  data?: {
    items: ProfessorItem[];
    page: number;
    limit: number;
    total: number;
  };
};

type ProfessorDetailResponse = {
  data?: ProfessorItem;
};

type TagOption = {
  id: string;
  name: string;
};

type TagsResponse = {
  data?: TagOption[];
};

const statuses: ProfessorStatus[] = [
  "draft",
  "sent",
  "replied",
  "followup",
  "interview",
  "accepted",
  "rejected",
];

const statusLabels: Record<ProfessorStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  replied: "Replied",
  followup: "Follow up",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

const sortOptions = [
  { label: "Recent Contact", value: "last_contact" },
  { label: "Deadline", value: "deadline" },
] as const;

const listState = reactive({
  items: [] as ProfessorItem[],
  page: 1,
  limit: 10,
  total: 0,
  q: "",
  status: "" as "" | ProfessorStatus,
  country: "",
  sort: "last_contact" as "last_contact" | "deadline",
  loading: false,
  error: "",
});

const showForm = ref(false);
const isEditing = ref(false);
const selectedProfessorId = ref<string | null>(null);
const formPending = ref(false);
const formError = ref("");
const formSuccess = ref("");

const detailsLoading = ref(false);
const detailsError = ref("");
const tagInput = ref("");
const tagsLoading = ref(false);
const availableTags = ref<TagOption[]>([]);

const form = reactive({
  id: "",
  name: "",
  email: "",
  universityName: "",
  department: "",
  country: "",
  researchArea: "",
  deadlineAt: "",
  notes: "",
  status: "draft" as ProfessorStatus,
  nextFollowupAt: "",
  tags: [] as string[],
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(listState.total / listState.limit)),
);

const tagSuggestions = computed(() => {
  const lower = tagInput.value.trim().toLowerCase();

  if (!lower) {
    return availableTags.value
      .map((tag) => tag.name)
      .filter((tag) => !form.tags.includes(tag))
      .slice(0, 6);
  }

  return availableTags.value
    .map((tag) => tag.name)
    .filter(
      (tag) => tag.includes(lower) && !form.tags.includes(tag),
    )
    .slice(0, 6);
});

const resetMessages = () => {
  listState.error = "";
  formError.value = "";
  formSuccess.value = "";
  detailsError.value = "";
};

const emptyForm = () => {
  form.id = "";
  form.name = "";
  form.email = "";
  form.universityName = "";
  form.department = "";
  form.country = "";
  form.researchArea = "";
  form.deadlineAt = "";
  form.notes = "";
  form.status = "draft";
  form.nextFollowupAt = "";
  form.tags = [];
};

const toApiDateTime = (localDateTime: string) => {
  if (!localDateTime) {
    return null;
  }

  const date = new Date(localDateTime);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toLocalDateTime = (iso: string | null | undefined) => {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
};

const formatDate = (iso: string | null) => {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
};

const createQueryParams = () => {
  const params = new URLSearchParams();
  params.set("page", String(listState.page));
  params.set("limit", String(listState.limit));
  params.set("sort", listState.sort);

  if (listState.q.trim()) {
    params.set("q", listState.q.trim());
  }

  if (listState.status) {
    params.set("status", listState.status);
  }

  if (listState.country.trim()) {
    params.set("country", listState.country.trim());
  }

  return params.toString();
};

const fetchProfessors = async () => {
  listState.loading = true;
  listState.error = "";

  try {
    const query = createQueryParams();
    const response = await $fetch<ProfessorListResponse>(
      `/api/professors?${query}`,
    );

    listState.items = response?.data?.items ?? [];
    listState.page = response?.data?.page ?? 1;
    listState.limit = response?.data?.limit ?? 10;
    listState.total = response?.data?.total ?? 0;
  } catch (error: any) {
    listState.error =
      error?.data?.error?.message ?? "Could not load professors.";
  } finally {
    listState.loading = false;
  }
};

const fetchTags = async () => {
  tagsLoading.value = true;

  try {
    const response = await $fetch<TagsResponse>("/api/tags");
    availableTags.value = response?.data ?? [];
  } finally {
    tagsLoading.value = false;
  }
};

const loadProfessorDetail = async (id: string) => {
  detailsLoading.value = true;
  detailsError.value = "";

  try {
    const response = await $fetch<ProfessorDetailResponse>(`/api/professors/${id}`);
    const professor = response?.data;

    if (!professor) {
      detailsError.value = "Professor not found.";
      return;
    }

    form.id = professor.id;
    form.name = professor.professorName;
    form.email = professor.email;
    form.universityName = professor.universityName;
    form.department = professor.department ?? "";
    form.country = professor.country ?? "";
    form.researchArea = professor.researchArea ?? "";
    form.deadlineAt = toLocalDateTime(professor.deadlineAt);
    form.notes = professor.notes ?? "";
    form.status = professor.status;
    form.nextFollowupAt = toLocalDateTime(professor.nextFollowupAt);
    form.tags = professor.tags ?? [];

    isEditing.value = true;
    selectedProfessorId.value = id;
    showForm.value = true;
  } catch (error: any) {
    detailsError.value =
      error?.data?.error?.message ?? "Could not load professor details.";
  } finally {
    detailsLoading.value = false;
  }
};

const openCreate = () => {
  resetMessages();
  emptyForm();
  isEditing.value = false;
  selectedProfessorId.value = null;
  showForm.value = true;
};

const cancelForm = () => {
  showForm.value = false;
  isEditing.value = false;
  selectedProfessorId.value = null;
  formError.value = "";
  formSuccess.value = "";
  emptyForm();
};

const createProfessorPayload = () => ({
  name: form.name,
  email: form.email,
  universityName: form.universityName,
  department: form.department.trim() || null,
  country: form.country.trim() || null,
  researchArea: form.researchArea.trim() || null,
  deadlineAt: toApiDateTime(form.deadlineAt),
  notes: form.notes.trim() || null,
});

const saveProfessor = async () => {
  formPending.value = true;
  formError.value = "";
  formSuccess.value = "";

  try {
    if (isEditing.value && form.id) {
      await $fetch(`/api/professors/${form.id}`, {
        method: "PUT",
        body: createProfessorPayload(),
      });

      formSuccess.value = "Professor updated.";
    } else {
      await $fetch("/api/professors", {
        method: "POST",
        body: createProfessorPayload(),
      });

      formSuccess.value = "Professor created.";
      emptyForm();
    }

    await fetchProfessors();
  } catch (error: any) {
    formError.value = error?.data?.error?.message ?? "Save failed.";
  } finally {
    formPending.value = false;
  }
};

const removeProfessor = async (id: string) => {
  const confirmed = window.confirm(
    "Delete this professor? You can continue with other records.",
  );

  if (!confirmed) {
    return;
  }

  try {
    await $fetch(`/api/professors/${id}`, {
      method: "DELETE",
    });

    if (selectedProfessorId.value === id) {
      cancelForm();
    }

    await fetchProfessors();
  } catch (error: any) {
    listState.error = error?.data?.error?.message ?? "Delete failed.";
  }
};

const toFollowupIso = () => {
  const selected = toApiDateTime(form.nextFollowupAt);

  if (selected) {
    return selected;
  }

  const fallback = new Date();
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  return fallback.toISOString();
};

const changeStatus = async (id: string, status: ProfessorStatus) => {
  try {
    await $fetch(`/api/professors/${id}/status`, {
      method: "POST",
      body: {
        status,
        nextFollowupAt: status === "followup" ? toFollowupIso() : null,
      },
    });

    if (selectedProfessorId.value === id) {
      await loadProfessorDetail(id);
    }

    await fetchProfessors();
  } catch (error: any) {
    listState.error =
      error?.data?.error?.message ?? "Status update failed.";
  }
};

const addTag = async (name: string) => {
  if (!isEditing.value || !form.id) {
    formError.value = "Save the professor first, then manage tags.";
    return;
  }

  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  if (form.tags.includes(normalized)) {
    tagInput.value = "";
    return;
  }

  try {
    await $fetch(`/api/professors/${form.id}/tags`, {
      method: "POST",
      body: {
        add: [normalized],
        remove: [],
      },
    });

    form.tags = [...form.tags, normalized].sort((a, b) => a.localeCompare(b));
    tagInput.value = "";
    await fetchTags();
  } catch (error: any) {
    formError.value = error?.data?.error?.message ?? "Could not add tag.";
  }
};

const removeTag = async (name: string) => {
  if (!form.id) {
    return;
  }

  try {
    await $fetch(`/api/professors/${form.id}/tags`, {
      method: "POST",
      body: {
        add: [],
        remove: [name],
      },
    });

    form.tags = form.tags.filter((tag) => tag !== name);
  } catch (error: any) {
    formError.value = error?.data?.error?.message ?? "Could not remove tag.";
  }
};

const submitFilters = async () => {
  listState.page = 1;
  await fetchProfessors();
};

const clearFilters = async () => {
  listState.q = "";
  listState.status = "";
  listState.country = "";
  listState.sort = "last_contact";
  listState.page = 1;
  await fetchProfessors();
};

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value || page === listState.page) {
    return;
  }

  listState.page = page;
  await fetchProfessors();
};

await Promise.all([fetchProfessors(), fetchTags()]);
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-zinc-900">Professors</h1>
        <p class="text-sm text-zinc-600">
          Manage your outreach targets, statuses, and follow-up context.
        </p>
      </div>
      <AppButton type="button" @click="openCreate">Add professor</AppButton>
    </header>

    <section class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <form class="grid gap-3 md:grid-cols-2 xl:grid-cols-5" @submit.prevent="submitFilters">
        <input
          v-model="listState.q"
          class="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          placeholder="Search name, email, university"
        />

        <select
          v-model="listState.status"
          class="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        >
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ statusLabels[status] }}
          </option>
        </select>

        <input
          v-model="listState.country"
          class="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          placeholder="Filter by country"
        />

        <select
          v-model="listState.sort"
          class="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
        >
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            Sort: {{ option.label }}
          </option>
        </select>

        <div class="flex gap-2">
          <AppButton class="flex-1" type="submit">Apply</AppButton>
          <AppButton class="flex-1" type="button" variant="secondary" @click="clearFilters">
            Clear
          </AppButton>
        </div>
      </form>
    </section>

    <section
      v-if="showForm"
      class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div class="mb-4 flex items-center justify-between gap-2">
        <h2 class="text-lg font-semibold text-zinc-900">
          {{ isEditing ? "Edit professor" : "Create professor" }}
        </h2>
        <AppButton type="button" variant="secondary" @click="cancelForm">Close</AppButton>
      </div>

      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="saveProfessor">
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Name</label>
          <input
            v-model="form.name"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Email</label>
          <input
            v-model="form.email"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            type="email"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">University</label>
          <input
            v-model="form.universityName"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Department</label>
          <input
            v-model="form.department"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Country</label>
          <input
            v-model="form.country"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Deadline</label>
          <input
            v-model="form.deadlineAt"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            type="datetime-local"
          />
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-800">Research area</label>
          <textarea
            v-model="form.researchArea"
            class="min-h-20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-800">Notes</label>
          <textarea
            v-model="form.notes"
            class="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>

        <div v-if="isEditing" class="md:col-span-2 grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-800">Status</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
              @change="changeStatus(form.id, form.status)"
            >
              <option v-for="status in statuses" :key="status" :value="status">
                {{ statusLabels[status] }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-800">Next follow-up</label>
            <input
              v-model="form.nextFollowupAt"
              class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
              type="datetime-local"
            />
          </div>

          <div class="md:col-span-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p class="mb-2 text-sm font-medium text-zinc-800">Tags</p>
            <div class="mb-2 flex flex-wrap gap-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700"
              >
                {{ tag }}
                <button
                  type="button"
                  class="text-zinc-500 hover:text-zinc-900"
                  @click="removeTag(tag)"
                >
                  x
                </button>
              </span>
              <span v-if="form.tags.length === 0" class="text-xs text-zinc-500">
                No tags yet.
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <input
                v-model="tagInput"
                class="min-w-52 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Add tag"
                @keydown.enter.prevent="addTag(tagInput)"
              />
              <AppButton type="button" variant="secondary" @click="addTag(tagInput)">
                Add tag
              </AppButton>
            </div>

            <div v-if="tagsLoading" class="mt-2 text-xs text-zinc-500">Loading tags...</div>
            <div v-else-if="tagSuggestions.length > 0" class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="suggestion in tagSuggestions"
                :key="suggestion"
                type="button"
                class="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                @click="addTag(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="formError" class="md:col-span-2 rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {{ formError }}
        </p>
        <p v-if="formSuccess" class="md:col-span-2 rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {{ formSuccess }}
        </p>

        <div class="md:col-span-2 flex justify-end gap-2">
          <AppButton type="button" variant="secondary" @click="cancelForm">Cancel</AppButton>
          <AppButton type="submit" :loading="formPending">
            {{ isEditing ? "Save changes" : "Create professor" }}
          </AppButton>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th class="px-4 py-3 font-medium">Professor</th>
              <th class="px-4 py-3 font-medium">University</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Deadline</th>
              <th class="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="listState.loading">
              <td colspan="5" class="px-4 py-6 text-center text-zinc-500">Loading professors...</td>
            </tr>
            <tr v-else-if="listState.items.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-zinc-500">No professors found.</td>
            </tr>
            <tr
              v-for="item in listState.items"
              :key="item.id"
              class="border-b border-zinc-100 last:border-b-0"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-zinc-900">{{ item.professorName }}</p>
                <p class="text-xs text-zinc-600">{{ item.email }}</p>
              </td>
              <td class="px-4 py-3 text-zinc-700">
                {{ item.universityName }}
              </td>
              <td class="px-4 py-3">
                <span class="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700">
                  {{ statusLabels[item.status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-zinc-700">{{ formatDate(item.deadlineAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <AppButton type="button" variant="secondary" @click="loadProfessorDetail(item.id)">
                    Edit
                  </AppButton>
                  <AppButton type="button" variant="secondary" @click="removeProfessor(item.id)">
                    Delete
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600">
        <p>
          Showing {{ listState.items.length }} of {{ listState.total }}
        </p>
        <div class="flex items-center gap-2">
          <AppButton type="button" variant="secondary" @click="goToPage(listState.page - 1)">
            Prev
          </AppButton>
          <span>Page {{ listState.page }} / {{ totalPages }}</span>
          <AppButton type="button" variant="secondary" @click="goToPage(listState.page + 1)">
            Next
          </AppButton>
        </div>
      </div>

      <p v-if="listState.error" class="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-700">
        {{ listState.error }}
      </p>
      <p v-if="detailsError" class="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-700">
        {{ detailsError }}
      </p>
      <p v-if="detailsLoading" class="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500">
        Loading details...
      </p>
    </section>
  </section>
</template>
