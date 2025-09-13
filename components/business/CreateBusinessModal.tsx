'use client'

import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import UploadcareImage from '@uploadcare/nextjs-loader'
import { Button } from '../ui/button'
import { useMutation, useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import Select, { MultiValue, StylesConfig, SingleValue } from 'react-select'
import countryList from 'react-select-country-list'
import { useSolOnly } from '@/contexts/SolOnlyContext'
import { useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'

interface CreateBusinessModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UploadcareWindow extends Window {
  uploadcare: {
    fileFrom: (type: string, file: File, options?: { publicKey: string; signature: string; expire: string }) => Promise<{ cdnUrl: string }>;
  };
}

interface Category {
  _id: string;
  name: string;
  industry_id: string;
}

interface CountryOption { label: string; value: string; }

interface IndustryOption { label: string; value: string; }

interface CategoryOption { label: string; value: string; industry_id: string; }

interface FormData {
  name: string;
  slug: string;
  logoUrl: string;
  industry_id: string;
  category_id: string;
  costPerArea: number;
  min_area: number;
  serviceable_countries: string[];
  currency: string;
}

function makeSelectStyles<T, M extends boolean>(): StylesConfig<T, M> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: '44px',
      backgroundColor: 'var(--bg-color)',
      borderColor: state.isFocused ? 'var(--ring-color)' : 'var(--border-color)',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 2px var(--ring-color)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--ring-color)' : 'var(--border-hover-color)'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--bg-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--primary-color)' 
        : state.isFocused 
          ? 'var(--hover-color)' 
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-color)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--primary-color)',
      }
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-color)'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-color)'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--tag-bg)',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--text-color)',
      padding: '2px 8px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--text-color)',
      ':hover': {
        backgroundColor: 'var(--tag-remove-hover)',
        color: 'var(--text-color)',
      },
    }),
  };
}

const selectStylesCountry = makeSelectStyles<CountryOption, true>();
const selectStylesIndustry = makeSelectStyles<IndustryOption, false>();
const selectStylesCategory = makeSelectStyles<CategoryOption, false>();

export default function CreateBusinessModal({ isOpen, onClose }: CreateBusinessModalProps) {
  const { isSignedIn } = useUser()
  const { currency, formatSol } = useSolOnly()
  const createBusiness = useMutation(api.brands.create)
  const getUploadSignature = useAction(api.uploadcare.getUploadSignature)
  const [selectedIndustry, setSelectedIndustry] = React.useState('')
  const router = useRouter()

  const industries = useQuery(api.industries.listIndustries, {}) || [];
  const categories = useQuery(api.categories.getByIndustry, selectedIndustry ? { industryId: selectedIndustry as Id<"industries"> } : 'skip') as Category[] || [];
  const industryOptions: IndustryOption[] = industries.map((i: { _id: string; name: string }) => ({ label: i.name, value: i._id }));
  const categoryOptions: CategoryOption[] = categories.map((c: Category) => ({ label: c.name, value: c._id, industry_id: c.industry_id }));

  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    slug: '',
    logoUrl: '',
    industry_id: '',
    category_id: '',
    costPerArea: 0,
    min_area: 0,
    serviceable_countries: [],
    currency: currency.code,
  })
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const countryOptions = React.useMemo(() => countryList().getData().map((c: CountryOption) => ({ label: c.label, value: c.value })), [])

  React.useEffect(() => {
    // Load Uploadcare widget script
    const script = document.createElement('script')
    script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  React.useEffect(() => {
    // Update currency whenever it changes in the context
    setFormData(prev => ({
      ...prev,
      currency: currency.code
    }))
  }, [currency])

  // Add CSS variables for theming
  React.useEffect(() => {
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    
    root.style.setProperty('--bg-color', isDark ? '#1c1917' : '#ffffff');
    root.style.setProperty('--border-color', isDark ? '#44403c' : '#d6d3d1');
    root.style.setProperty('--border-hover-color', isDark ? '#57534e' : '#a8a29e');
    root.style.setProperty('--text-color', isDark ? '#e7e5e4' : '#1c1917');
    root.style.setProperty('--primary-color', '#facc15');
    root.style.setProperty('--ring-color', isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.3)');
    root.style.setProperty('--hover-color', isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.1)');
    root.style.setProperty('--tag-bg', isDark ? '#292524' : '#f5f5f4');
    root.style.setProperty('--tag-remove-hover', isDark ? '#44403c' : '#e7e5e4');
  }, []);

  const resetForm = () => {
    setFormData({ name: '', slug: '', logoUrl: '', industry_id: '', category_id: '', costPerArea: 0, min_area: 0, serviceable_countries: [], currency: currency.code })
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const isFormValid =
    formData.name.trim() &&
    formData.slug.trim() &&
    formData.industry_id &&
    formData.category_id &&
    formData.costPerArea > 0 &&
    formData.min_area > 0 &&
    formData.serviceable_countries.length > 0 &&
    !!logoFile;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error('Please sign in to create a business')
      return
    }

    // Validate all fields
    if (!formData.name.trim()) {
      toast.error('Business name is required')
      return
    }
    if (!formData.slug.trim()) {
      toast.error('Business URL slug is required')
      return
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('URL slug can only contain lowercase letters, numbers, and hyphens')
      return
    }
    if (!logoFile) {
      toast.error('Business logo is required')
      return
    }
    if (!formData.industry_id) {
      toast.error('Industry is required')
      return
    }
    if (!formData.category_id) {
      toast.error('Category is required')
      return
    }
    if (!formData.costPerArea || formData.costPerArea <= 0) {
      toast.error('Cost per area is required and must be greater than 0')
      return
    }
    if (!formData.min_area || formData.min_area <= 0) {
      toast.error('Minimum area is required and must be greater than 0')
      return
    }
    if (!formData.serviceable_countries.length) {
      toast.error('At least one country must be selected')
      return
    }

    setIsLoading(true)
    try {
      let logoUrl = ''
      if (logoFile) {
        const { publicKey, signature, expire } = await getUploadSignature()
        // TypeScript-safe logging
        console.log('Uploadcare credentials:', {
          publicKey,
          signature,
          expire,
          expireType: typeof expire,
        })
        console.log('Uploading file:', {
          name: logoFile.name,
          size: logoFile.size,
          type: logoFile.type,
        })
        if (typeof window === 'undefined' || !('uploadcare' in window)) {
          throw new Error('Uploadcare widget is not loaded. Please try again later.')
        }
        const uploadcare = (window as unknown as UploadcareWindow).uploadcare
        let filePromise, file;
        try {
          filePromise = uploadcare.fileFrom('object', logoFile, {
            publicKey,
            signature,
            expire,
          })
          file = await filePromise
          logoUrl = (file as { cdnUrl: string }).cdnUrl
          console.log('Upload successful:', { logoUrl });
        } catch (uploadErr: unknown) {
          console.error('Uploadcare upload failed:', uploadErr);
          if (typeof uploadErr === 'string') {
            console.error('Uploadcare upload error (string):', uploadErr)
          } else if (uploadErr instanceof Error) {
            console.error('Uploadcare upload error (Error):', uploadErr.message, uploadErr.stack)
          } else {
            console.error('Uploadcare upload error (unknown):', uploadErr)
          }
          throw new Error(`Upload failed: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
        }
      }

      const result = await createBusiness({
        name: formData.name,
        slug: formData.slug,
        logoUrl,
        industry_id: formData.industry_id,
        category_id: formData.category_id,
        costPerArea: Number(formData.costPerArea),
        min_area: Number(formData.min_area),
        serviceable_countries: formData.serviceable_countries,
        currency: currency.code,
      })

      toast.success('Business created successfully!')
      resetForm()
      onClose()
      // Redirect to new slug-based URL
      router.push(`/${result.slug}/franchise`)
    } catch (err) {
      // Improved error logging and reporting
      console.error('Form submission error:', err, typeof err, JSON.stringify(err));
      toast.error(
        err === 'upload'
          ? 'Image upload failed. Please try again.'
          : err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Auto-generate slug when business name changes (only if slug is empty or was auto-generated)
      if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
  }

  const handleCountryChange = (selected: MultiValue<CountryOption>) => {
    setFormData(prev => ({
      ...prev,
      serviceable_countries: selected.map((opt) => opt.value)
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Logo file size must be less than 4MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative bg-white dark:bg-stone-800 rounded-2xl max-w-lg w-full mx-4 p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 dark:text-gray-100 dark:hover:text-gray-500 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>

                <Dialog.Title className="text-xl font-semibold dark:text-white/80 text-gray-900 mb-6">
                  Create New Business
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="flex items-center gap-6">
                    <div className={`relative h-20 w-20 rounded-lg border-2 border-dashed dark:border-stone-700 flex items-center justify-center overflow-hidden ${!logoFile && 'border-red-500'}`}>
                      {logoPreview ? (
                        <UploadcareImage
                          src={logoPreview}
                          alt="Business Logo"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white/80 mb-1">Business Logo <span className="text-red-500">*</span></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Upload a logo for your business. Max size 4MB.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogoClick}
                        >
                          {logoFile ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                        {logoFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemoveLogo}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business URL Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                        /{' '}
                      </span>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full h-11 pl-8 pr-4 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="business-name-slug"
                        required
                        pattern="[a-z0-9-]+"
                        title="Only lowercase letters, numbers, and hyphens allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be your business URL: /{formData.slug || 'business-name-slug'}
                    </p>
                  </div>

                  {/* Row 2: Industry and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="industry_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <Select<IndustryOption, false>
                        name="industry_id"
                        options={industryOptions}
                        value={industryOptions.find(opt => opt.value === formData.industry_id) || null}
                        onChange={(selected: SingleValue<IndustryOption>) => {
                          setFormData(prev => ({
                            ...prev,
                            industry_id: selected?.value || '',
                            category_id: '', // reset category when industry changes
                          }));
                          setSelectedIndustry(selected?.value || '');
                        }}
                        styles={selectStylesIndustry}
                        placeholder="Select industry..."
                        isClearable
                        classNamePrefix="select"
                        required
                        isDisabled={industryOptions.length === 0}
                      />
                    </div>
                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Select<CategoryOption, false>
                        name="category_id"
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === formData.category_id) || null}
                        onChange={(selected: SingleValue<CategoryOption>) => {
                          setFormData(prev => ({
                            ...prev,
                            category_id: selected?.value || '',
                          }));
                        }}
                        styles={selectStylesCategory}
                        placeholder="Select category..."
                        isClearable
                        classNamePrefix="select"
                        required
                        isDisabled={!formData.industry_id || categoryOptions.length === 0}
                      />
                    </div>
                  </div>
                  {/* Row 3: Countries business is registered*/}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Countries Registered <span className="text-red-500">*</span>
                    </label>
                    <Select<CountryOption, true>
                      isMulti
                      name="serviceable_countries"
                      options={countryOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={handleCountryChange}
                      value={countryOptions.filter((opt) => formData.serviceable_countries.includes(opt.value))}
                      styles={selectStylesCountry}
                      placeholder="Select countries..."
                      required
                    />
                  </div>
                  {/* Row 4: Cost per Area and Min Area */}
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="min_area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Area For A Franchise <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="min_area"
                          name="min_area"
                          value={formData.min_area}
                          onChange={handleInputChange}
                          className="w-full h-11 pl-4 pr-16 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter minimum area"
                          required
                          min={1}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          sqft
                        </span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="costPerArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cost Per Area (SOL) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          SOL
                        </span>
                        <input
                          type="number"
                          id="costPerArea"
                          name="costPerArea"
                          value={formData.costPerArea}
                          onChange={handleInputChange}
                          className="w-full h-11 pl-12 pr-4 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter cost per area in SOL"
                          required
                          min={0.0001}
                          step={0.0001}
                        />
                      </div>
                    </div>
                    
                  </div>
                  {/* Min Total Investment Display */}
                  {(formData.costPerArea > 0 && formData.min_area > 0) && (
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-l-4 border-purple-400 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-200">
                          Minimum Total Investment
                        </div>
                        <div className="bg-white dark:bg-stone-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Investment Required</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                            {formatSol(formData.costPerArea * formData.min_area)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <strong>Note:</strong> This includes working capital up to 3 years, rent, salary, and maintenance.
                        </div>
                      </div>
                    </div>
                  )}
                  

                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid || !isSignedIn}
                    className="w-full h-11 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                  >
                    {isLoading ? 'Creating...' : 'Create Business'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 