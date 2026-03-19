export interface PalettePreset {
  name: string;
  colors: string[];
  category: string;
}

export const palettePresets: PalettePreset[] = [
  // 3-Color Palettes
  {
    name: "Minimalist Cool",
    colors: ["#E2E8F0", "#94A3B8", "#0F172A"],
    category: "3-color",
  },
  {
    name: "Warm Contrast",
    colors: ["#FFFBEB", "#F59E0B", "#78350F"],
    category: "3-color",
  },
  {
    name: "Forest Basics",
    colors: ["#ECFDF5", "#10B981", "#064E3B"],
    category: "3-color",
  },

  // 4-Color Palettes
  {
    name: "Cyber Punch",
    colors: ["#120458", "#7A04EB", "#FE75FE", "#FF00A0"],
    category: "4-color",
  },
  {
    name: "Desert Oasis",
    colors: ["#2C363F", "#E75A7C", "#F2F5EA", "#D6EADF"],
    category: "4-color",
  },
  {
    name: "Vintage Card",
    colors: ["#EAE2B7", "#FCBF49", "#F77F00", "#D62828"],
    category: "4-color",
  },

  // 5-Color Palettes
  {
    name: "Velvet Blossom",
    colors: ["#735D78", "#E9BBBE", "#EBA5A2", "#246A73", "#231C36"],
    category: "5-color",
  },
  {
    name: "Lavender Hush",
    colors: ["#9B9E99", "#BBA4BD", "#DBCFE6", "#E9DDEB", "#ECEBF5"],
    category: "5-color",
  },
  {
    name: "City Haven",
    colors: ["#757C8D", "#A68F83", "#AE898F", "#8F6D6E", "#283E4C"],
    category: "5-color",
  },
  {
    name: "Sundown Spark",
    colors: ["#A23438", "#BB5E61", "#D99C97", "#F3C9AF", "#FBE3D0"],
    category: "5-color",
  },
  {
    name: "Coastal Retreat",
    colors: ["#335765", "#74A8A4", "#B6D9E0", "#DBE2DC", "#7F543D"],
    category: "5-color",
  },
  {
    name: "Bay Bloom",
    colors: ["#6F9C9F", "#C0DFD4", "#F0D6B6", "#E08374", "#AC4E5C"],
    category: "5-color",
  },
  {
    name: "Candy Breeze",
    colors: ["#FF8082", "#ED979A", "#DCB3B5", "#B2E1E1", "#A4FDFD"],
    category: "5-color",
  },
  {
    name: "Metropolis Night",
    colors: ["#272727", "#484848", "#FFB900", "#009EFF", "#D7D7D7"],
    category: "5-color",
  },
  {
    name: "Carnival Brights",
    colors: ["#F0932B", "#EB4D4B", "#6AB04C", "#4834D4", "#30336B"],
    category: "5-color",
  },
  {
    name: "Spring Sorbet",
    colors: ["#A29BFE", "#FFEAA7", "#FAB1A0", "#74B9FF", "#55EFC4"],
    category: "5-color",
  },
  {
    name: "Earthy Greens",
    colors: ["#6B705C", "#A5A58D", "#B7B7A4", "#DDBEA9", "#FFE8D6"],
    category: "5-color",
  },
  {
    name: "Spiced Plum",
    colors: ["#320A28", "#511730", "#8E443D", "#E08E45", "#FACFAD"],
    category: "5-color",
  },
  {
    name: "Tropical Harmony",
    colors: ["#023A38", "#06585B", "#B767AE", "#FF7742", "#FFC847"],
    category: "5-color",
  },
  {
    name: "Aqua Serenity",
    colors: ["#026968", "#1B8887", "#3BA7A6", "#74CECD", "#B9E2E2"],
    category: "5-color",
  },
  {
    name: "Retro Soul",
    colors: ["#194A4D", "#318583", "#EBE8DD", "#E3BE68", "#764B4B"],
    category: "5-color",
  },
  {
    name: "Summer Splash (Blue)",
    colors: ["#006C70", "#20929B", "#E6F3E4", "#CFED76", "#356FEA"],
    category: "5-color",
  },
  {
    name: "Summer Lilac",
    colors: ["#0B6568", "#3F959D", "#67BEC2", "#E6C6F8", "#FDE2F8"],
    category: "5-color",
  },
  {
    name: "Tokyo Pop",
    colors: ["#08464A", "#0C757D", "#3A9CA3", "#EEDDEB", "#FC8FD6"],
    category: "5-color",
  },
  {
    name: "Navy Terracotta",
    colors: ["#2C3646", "#BF4C4E", "#EFEADF", "#EDADC4", "#C98F62"],
    category: "5-color",
  },
  {
    name: "Fresh",
    colors: ["#2B1B17", "#5C4033", "#6A7B54", "#7DA1B1", "#D8DCD6", "#F3EFE9"],
    category: "6-color",
  },
  {
    name: "Spiced",
    colors: ["#2B1E1A", "#861D1D", "#BF6F31", "#F4B34C", "#EBCCBA", "#E8E2D1"],
    category: "6-color",
  },
  {
    name: "Frosted",
    colors: ["#2A3439", "#4B5963", "#707C84", "#A9C0CE", "#DDE7ED", "#E6E6E6"],
    category: "6-color",
  },
  {
    name: "Plum Fade",
    colors: ["#150016", "#29104A", "#522C5D", "#845162", "#E3B6B1", "#F7E3DB"],
    category: "6-color",
  },
  {
    name: "Regal",
    colors: ["#11100F", "#5D1C34", "#A67D44", "#899481", "#CDBCAB", "#EFE9E1"],
    category: "6-color",
  },
  {
    name: "Sanddune",
    colors: ["#3A2D28", "#A48374", "#CBAD8D", "#D1C7BD", "#EBE3DB", "#F1EDE6"],
    category: "6-color",
  },
  {
    name: "Dusk",
    colors: ["#3D2321", "#6E3F40", "#9C5B45", "#9BA9B3", "#D0D7E0", "#F1F1F1"],
    category: "6-color",
  },
  {
    name: "Ocean Depths",
    colors: ["#031716", "#032F30", "#0A7075", "#0C969C", "#6BA3BE", "#274D60"],
    category: "6-color",
  },
  {
    name: "Twilight Peach",
    colors: ["#03122F", "#19305C", "#413B61", "#AE7DAC", "#F3DADF", "#F1916D"],
    category: "6-color",
  },
  {
    name: "Crimson Dusk",
    colors: ["#181A2F", "#242E49", "#37415C", "#FDA481", "#B4182D", "#54162B"],
    category: "6-color",
  },
  {
    name: "Dusty Rose & Blue",
    colors: ["#0D1E4C", "#C48CB3", "#E5C9D7", "#83A6CE", "#26415E", "#0B1B32"],
    category: "6-color",
  },
  {
    name: "Sunset Hues",
    colors: ["#1B1931", "#44174E", "#662249", "#A34054", "#ED9E59", "#E98CB9"],
    category: "6-color",
  },
];
