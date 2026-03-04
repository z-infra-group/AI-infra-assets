'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC<{ module?: string }> = ({ module }) => (
  <div>
    {module ? `${module} ` : ''}Database seeded successfully! You can now{' '}
    <a target="_blank" href="/">
      visit your website
    </a>
  </div>
)

type SeedModule = {
  key: string
  label: string
  description: string
  modules: Array<{
    key: string
    label: string
    description: string
    dependencies?: string[]
  }>
}

const seedGroups: SeedModule[] = [
  {
    key: 'all',
    label: '全部',
    description: '一键完成所有数据 seeding',
    modules: [
      {
        key: 'all',
        label: 'Seed All Modules',
        description: 'Seed all data at once (recommended for first time)',
      },
    ],
  },
  {
    key: 'basic',
    label: '基础数据',
    description: 'Core data required by other modules',
    modules: [
      {
        key: 'core',
        label: 'Core Data',
        description: 'Users, categories, media files',
        dependencies: [],
      },
      {
        key: 'globals',
        label: 'Globals & Forms',
        description: 'Header, footer, contact form',
        dependencies: [],
      },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    description: 'Website content and pages',
    modules: [
      {
        key: 'content',
        label: 'Content',
        description: 'Pages, posts',
        dependencies: ['core'],
      },
    ],
  },
  {
    key: 'ai',
    label: 'AI 功能',
    description: 'Prompt and LLM management',
    modules: [
      {
        key: 'prompts',
        label: 'Prompts',
        description: 'Prompts and prompt tests',
        dependencies: ['core'],
      },
      {
        key: 'llm',
        label: 'LLM Providers & Models',
        description: 'LLM providers and models',
        dependencies: ['core'],
      },
    ],
  },
]

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const [seededModules, setSeededModules] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>('basic')

  const handleSeed = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, moduleKey: string) => {
      e.preventDefault()

      if (loading) {
        toast.info('Seeding already in progress.')
        return
      }

      const module = seedGroups
        .flatMap((group) => group.modules)
        .find((m) => m.key === moduleKey)

      if (!module) return

      // Check dependencies
      if (module.dependencies) {
        const missingDeps = module.dependencies.filter((dep) => !seededModules.has(dep))
        if (missingDeps.length > 0 && moduleKey !== 'all') {
          const depNames = missingDeps
            .map((dep) =>
              seedGroups
                .flatMap((g) => g.modules)
                .find((m) => m.key === dep)?.label || dep,
            )
            .join(', ')
          toast.error(`Please seed these first: ${depNames}`)
          return
        }
      }

      if (moduleKey !== 'all' && seededModules.has(moduleKey)) {
        toast.info(`${module.label} already seeded.`)
        return
      }

      if (moduleKey === 'all' && seededModules.has('all')) {
        toast.info('Database already seeded.')
        return
      }

      setLoading(moduleKey)

      try {
        const endpoint = moduleKey === 'all' ? '/next/seed' : `/next/seed-modules/${moduleKey}`
        const body = moduleKey !== 'all' && moduleKey !== 'core' && moduleKey !== 'globals'
          ? await getSharedData()
          : undefined

        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (response.ok) {
          if (moduleKey === 'all') {
            setSeededModules(new Set(['all']))
          } else {
            const newSeeded = new Set(seededModules)
            newSeeded.add(moduleKey)
            // Check if all modules are seeded
            const allModules = seedGroups.flatMap((g) => g.modules).map((m) => m.key)
            if (allModules.filter((m) => m !== 'all').every((m) => newSeeded.has(m))) {
              newSeeded.add('all')
            }
            setSeeded(newSeeded)
          }

          toast.promise(Promise.resolve(true), {
            loading: `Seeding ${module.label}...`,
            success: <SuccessMessage module={module.label} />,
            error: 'An error occurred while seeding.',
          })

          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[moduleKey]
            return newErrors
          })
        } else {
          throw new Error('An error occurred while seeding.')
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setErrors((prev) => ({ ...prev, [moduleKey]: error }))
        toast.error(`Failed to seed ${module.label}`)
      } finally {
        setLoading(null)
      }
    },
    [loading, seededModules, errors],
  )

  // Get shared data from already seeded modules
  const getSharedData = async () => {
    // TODO: Implement proper state management for seeded data IDs
    return {}
  }

  const isModuleSeeded = (key: string) => {
    if (key === 'all') return seededModules.has('all')
    return seededModules.has(key)
  }

  const isModuleLoading = (key: string) => loading === key

  const hasError = (key: string) => Boolean(errors[key])

  return (
    <div className="seedModules">
      {/* Tab Headers */}
      <div className="seedTabs">
        {seedGroups.map((group) => (
          <button
            key={group.key}
            className={`seedTab ${activeTab === group.key ? 'active' : ''}`}
            onClick={() => setActiveTab(group.key)}
          >
            {group.label}
            <span className="seedTabDescription">{group.description}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="seedTabContent">
        {seedGroups.map((group) => (
          <div
            key={group.key}
            className={`seedTabPanel ${activeTab === group.key ? 'active' : ''}`}
          >
            <div className="seedModuleGroup">
              <h4 className="seedGroupTitle">{group.label}</h4>
              <p className="seedGroupDesc">{group.description}</p>
              <div className="seedModuleList">
                {group.modules.map((module) => (
                  <div key={module.key} className="seedModuleItem">
                    <button
                      className={`seedButton ${
                        isModuleSeeded(module.key) ? 'seeded' : ''
                      } ${isModuleLoading(module.key) ? 'loading' : ''} ${
                        hasError(module.key) ? 'error' : ''
                      }`}
                      onClick={(e) => handleSeed(e, module.key)}
                      disabled={isModuleSeeded(module.key) || isModuleLoading(module.key)}
                    >
                      {module.label}
                    </button>
                    <span className="seedDescription">{module.description}</span>
                    {isModuleLoading(module.key) && (
                      <span className="seedStatus"> (seeding...)</span>
                    )}
                    {isModuleSeeded(module.key) && !isModuleLoading(module.key) && (
                      <span className="seedStatus"> ✓</span>
                    )}
                    {hasError(module.key) && !isModuleLoading(module.key) && (
                      <span className="seedStatus"> ✗</span>
                    )}
                    {module.dependencies && module.dependencies.length > 0 && (
                      <span className="seedDependencies">
                        Requires:{' '}
                        {module.dependencies.map((dep) =>
                          seedGroups
                            .flatMap((g) => g.modules)
                            .find((m) => m.key === dep)?.label || dep,
                        ).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
