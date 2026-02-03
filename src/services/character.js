export const loadCharacterData = async (accessToken, characterId, language = 'en') => {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept-Language': language
  }

  try {
    const [
      wallet,
      location,
      onlineStatus,
      skills,
      skillQueue,
      contacts,
      assets,
      orders,
      contracts,
      standings,
      medals,
      implants,
      clones,
      fatigue,
      notifications,
      roles,
      titles
    ] = await Promise.allSettled([
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/wallet/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/location/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/online/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/skills/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/skillqueue/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/contacts/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/assets/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/orders/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/contracts/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/standings/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/medals/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/implants/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/clones/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/fatigue/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/notifications/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/roles/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/titles/`, { headers })
    ])

    return {
      wallet: wallet.status === 'fulfilled' ? await wallet.value.json() : null,
      location: location.status === 'fulfilled' ? await location.value.json() : null,
      onlineStatus: onlineStatus.status === 'fulfilled' ? await onlineStatus.value.json() : null,
      skills: skills.status === 'fulfilled' ? await skills.value.json() : null,
      skillQueue: skillQueue.status === 'fulfilled' ? await skillQueue.value.json() : null,
      contacts: contacts.status === 'fulfilled' ? await contacts.value.json() : null,
      assets: assets.status === 'fulfilled' ? await assets.value.json() : null,
      orders: orders.status === 'fulfilled' ? await orders.value.json() : null,
      contracts: contracts.status === 'fulfilled' ? await contracts.value.json() : null,
      standings: standings.status === 'fulfilled' ? await standings.value.json() : null,
      medals: medals.status === 'fulfilled' ? await medals.value.json() : null,
      implants: implants.status === 'fulfilled' ? await implants.value.json() : null,
      clones: clones.status === 'fulfilled' ? await clones.value.json() : null,
      fatigue: fatigue.status === 'fulfilled' ? await fatigue.value.json() : null,
      notifications: notifications.status === 'fulfilled' ? await notifications.value.json() : null,
      roles: roles.status === 'fulfilled' ? await roles.value.json() : null,
      titles: titles.status === 'fulfilled' ? await titles.value.json() : null
    }
  } catch (error) {
    console.error('Failed to load character data:', error)
    throw error
  }
}

const resolveNames = async (data, language = 'en') => {
  try {
    const resolved = { ...data }
    
    // Resolve solar system name
    if (data.location?.solar_system_id) {
      try {
        const systemResponse = await fetch(`https://esi.evetech.net/latest/universe/systems/${data.location.solar_system_id}/?language=${language}`)
        if (systemResponse.ok) {
          const systemData = await systemResponse.json()
          resolved.location = {
            ...data.location,
            solar_system_name: systemData.name
          }
        }
      } catch (error) {
        console.error('Failed to resolve solar system name:', error)
      }
    }
    
    // Resolve ship type name
    if (data.shipType?.ship_type_id) {
      try {
        const shipResponse = await fetch(`https://esi.evetech.net/latest/universe/types/${data.shipType.ship_type_id}/?language=${language}`)
        if (shipResponse.ok) {
          const shipData = await shipResponse.json()
          resolved.shipType = {
            ...data.shipType,
            ship_type_name: shipData.name
          }
        }
      } catch (error) {
        console.error('Failed to resolve ship type name:', error)
      }
    }
    
    return resolved
  } catch (error) {
    console.error('Failed to resolve names:', error)
    return data
  }
}

export const loadFullCharacterData = async (accessToken, characterId, language = 'en') => {
  try {
    const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/?language=${language}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept-Language': language
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to load full character data:', error)
    throw error
  }
}

export const loadEssentialCharacterData = async (accessToken, characterId, language = 'en', forceRefresh = false) => {
  // Check cache first
  const cacheKey = `character_data_${characterId}`
  const cachedData = localStorage.getItem(cacheKey)
  const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`)
  
  // If cache exists and is less than 10 minutes old, return it
  if (!forceRefresh && cachedData && cacheTimestamp) {
    const cacheAge = Date.now() - parseInt(cacheTimestamp)
    if (cacheAge < 10 * 60 * 1000) { // 10 minutes
      return JSON.parse(cachedData)
    }
  }

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept-Language': language
  }

  try {
    const [wallet, location, onlineStatus, orders, shipType] = await Promise.allSettled([
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/wallet/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/location/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/online/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/orders/`, { headers }),
      fetch(`https://esi.evetech.net/latest/characters/${characterId}/ship/`, { headers })
    ])

    const result = {
      wallet: wallet.status === 'fulfilled' ? await wallet.value.json() : null,
      location: location.status === 'fulfilled' ? await location.value.json() : null,
      onlineStatus: onlineStatus.status === 'fulfilled' ? await onlineStatus.value.json() : null,
      orders: orders.status === 'fulfilled' ? await orders.value.json() : null,
      shipType: shipType.status === 'fulfilled' ? await shipType.value.json() : null
    }
    
    // Resolve IDs to names
    const resolvedResult = await resolveNames(result, language)
    
    // Cache the result with timestamp
    localStorage.setItem(cacheKey, JSON.stringify(resolvedResult))
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString())
    
    return resolvedResult
  } catch (error) {
    console.error('Failed to load essential character data:', error)
    throw error
  }
}
