export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

export const menuItems: MenuItem[] = [
  {
    id: 'burger-001',
    name: 'Classic Burger',
    description: 'Angus beef patty with lettuce, tomato, onion, and our secret sauce on a brioche bun.',
    price: 12.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
  },
  {
    id: 'burger-002',
    name: 'Bacon Cheeseburger',
    description: 'Classic burger topped with crispy bacon and melted cheddar cheese.',
    price: 14.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop'
  },
  {
    id: 'burger-003',
    name: 'Mushroom Swiss Burger',
    description: 'Sautéed mushrooms and Swiss cheese on a perfectly grilled patty.',
    price: 13.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop'
  },
  {
    id: 'pizza-001',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on a crispy thin crust.',
    price: 15.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop'
  },
  {
    id: 'pizza-002',
    name: 'Pepperoni Pizza',
    description: 'Loaded with pepperoni and mozzarella cheese on our signature sauce.',
    price: 16.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop'
  },
  {
    id: 'pizza-003',
    name: 'Supreme Pizza',
    description: 'Pepperoni, sausage, bell peppers, onions, olives, and mushrooms.',
    price: 18.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
  },
  {
    id: 'salad-001',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons, and creamy Caesar dressing.',
    price: 9.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop'
  },
  {
    id: 'salad-002',
    name: 'Garden Salad',
    description: 'Mixed greens, tomatoes, cucumbers, carrots, and your choice of dressing.',
    price: 8.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  },
  {
    id: 'drink-001',
    name: 'Craft Lemonade',
    description: 'Fresh-squeezed lemons with a hint of mint.',
    price: 4.99,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop'
  },
  {
    id: 'drink-002',
    name: 'Iced Tea',
    description: 'House-brewed black tea served over ice.',
    price: 3.99,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
  },
  {
    id: 'dessert-001',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
    price: 7.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop'
  },
  {
    id: 'dessert-002',
    name: 'New York Cheesecake',
    description: 'Creamy cheesecake with a graham cracker crust and strawberry topping.',
    price: 6.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop'
  }
]

export const categories = [...new Set(menuItems.map(item => item.category))]
