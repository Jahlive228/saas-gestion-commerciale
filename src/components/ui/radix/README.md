# Composants Radix UI

Ce dossier contient des composants réutilisables basés sur les primitives de Radix UI, intégrés avec le thème de l'application.

## Composants disponibles

### Select

Un composant de sélection basé sur Radix UI Select avec support du thème sombre/clair.

```tsx
import { Select } from "@/components/ui/radix";

const options = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "pending", label: "En attente" },
];

<Select
  options={options}
  placeholder="Sélectionner une option"
  value={selectedValue}
  onValueChange={setSelectedValue}
  error={hasError}
  hint="Message d'aide"
/>;
```

**Props :**

- `options`: Array d'objets avec `value` et `label`
- `placeholder`: Texte affiché quand aucune valeur n'est sélectionnée
- `value`: Valeur sélectionnée
- `onValueChange`: Callback appelé lors du changement
- `disabled`: Désactiver le composant
- `error`: Afficher l'état d'erreur
- `hint`: Message d'aide affiché en dessous

### Switch

Un interrupteur basé sur Radix UI Switch avec animations fluides.

```tsx
import { Switch } from "@/components/ui/radix";

<Switch checked={isEnabled} onCheckedChange={setIsEnabled} size="md" />;
```

**Props :**

- `checked`: État du switch
- `onCheckedChange`: Callback appelé lors du changement
- `disabled`: Désactiver le composant
- `size`: Taille ("sm" | "md")

### Tabs

Un système d'onglets basé sur Radix UI Tabs.

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/radix";

<Tabs defaultValue="tab1" onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
    <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
  </TabsList>

  <TabsContent value="tab1">Contenu de l'onglet 1</TabsContent>

  <TabsContent value="tab2">Contenu de l'onglet 2</TabsContent>
</Tabs>;
```

**Props Tabs :**

- `defaultValue`: Onglet actif par défaut
- `value`: Onglet actif (contrôlé)
- `onValueChange`: Callback appelé lors du changement d'onglet

## Intégration avec React Hook Form

### Select avec RHF

```tsx
import { useForm } from "react-hook-form";
import { Select } from "@/components/ui/radix";

const {
  watch,
  setValue,
  formState: { errors },
} = useForm();

<Select
  options={options}
  value={watch("fieldName")}
  onValueChange={(value) => setValue("fieldName", value)}
  error={!!errors.fieldName}
  hint={errors.fieldName?.message}
/>;
```

### Switch avec RHF

```tsx
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/radix";

const { watch, setValue } = useForm();

<Switch
  checked={watch("fieldName")}
  onCheckedChange={(checked) => setValue("fieldName", checked)}
/>;
```

## Thème et personnalisation

Tous les composants respectent automatiquement :

- Le thème sombre/clair de l'application
- Les couleurs de la marque (brand colors)
- Les états d'erreur et de focus
- L'accessibilité (ARIA attributes, navigation clavier)

Les composants utilisent les classes Tailwind CSS et les variables CSS personnalisées définies dans le thème.
