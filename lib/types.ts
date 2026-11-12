export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price_ttd: number;
  sizes: string[];
  colors: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
};

export type CustomOrder = {
  id: string;
  name: string;
  phone: string;
  email: string;
  item_type: string;
  quantity: number;
  sizes: string | null;
  colors: string | null;
  print_name: string | null;
  print_number: string | null;
  notes: string | null;
  design_url: string | null;
  needed_by: string | null;
  status: string;
  created_at: string;
};

export type CustomOrderResult = {
  ok: boolean;
  setup?: boolean;
  message: string;
  whatsapp: string;
};
